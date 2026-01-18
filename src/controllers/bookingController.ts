//logic for bookings - eg create booking update/delete booking, show all bookings etc

//to create a new booking:
// get the details from req.body and req.user
// check if all items are present
// check for limits of rent and days
// calculate totalcost
// create new prisma booking with details
// return the data

import prisma from "../lib/prisma.js";
import type { Response } from "express";

import type { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

//creating a booking-
export async function createBooking(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "unauthorised",
      });
    }

    //get the input details from user and from middleware
    const { rentPerDay, carName, days } = req.body;
    const userId = req.user.userId;

    if (!carName || !rentPerDay || !days) {
      return res.status(400).json({
        success: false,
        error: "incomplete details",
      });
    }
    if (rentPerDay > 2000 || days > 365) {
      return res.status(400).json({
        success: false,
        error: "invalid details",
      });
    }

    const totalCost = rentPerDay * days;

    //if all checks are satisfied, proceed to create the booking
    const newBooking = await prisma.booking.create({
      data: {
        //while assigning key-value pairs, the db-schema name will be key, and the input variables (req.body or req.user) will be assigned as value like this-
        user_id: userId,
        car_name: carName,
        rent_per_day: rentPerDay,
        days: days,
        status: "booked",
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        message: "Booking created successfully",
        bookingId: newBooking.id,
        totalCost: totalCost,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "error creating user",
    });
  }
}

////////////////////////////////////////////////////

//get bookings -
export async function getBookings(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      //ie. if there's no jwt payload coming with the request
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
    const userId = req.user.userId; //comes from the middleware
    const username = req.user.username; //from the mw
    const { bookingId, summary } = req.query; //query params (from the url)

    //if bookingId is required as a number (rather than a string default), this comes handy-
    const bookingIdNumber = Number(bookingId);

    if (isNaN(bookingIdNumber)) {
      return res.status(400).json({
        success: false,
        error: "invalid bookingId",
      });
    }

    if (summary === "true") {
      //run summary logic -summary of all bookings of the particular user
      const bookings = await prisma.booking.findMany({
        where: {
          user_id: userId, //grabbing user id here because we need full summary of the user
          status: {
            //check if any of these two status present
            in: ["booked", "completed"],
          },
        },
      });

      const totalBookings = bookings.length;
      const totalAmountSpent = bookings.reduce(
        (sum, booking) => sum + booking.days * booking.rent_per_day,
        0, //reduce is inbuilt js fn that takes sum (initially 0), and then adds it to current daysXrent, which becomes the sum for the next iteration and so on
      );

      return res.status(200).json({
        success: true,
        data: {
          userId,
          username,
          totalBookings,
          totalAmountSpent,
        },
      });
    } else if (bookingId) {
      //getting that one single specific booking done by the user
      const booking = await prisma.booking.findUnique({
        where: {
          id: bookingIdNumber, //grabbing bookingId and assigning it to the id inside booking schema
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: "booking not found",
        });
      }
      if (booking.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: "booking does not belong to user",
        });
      }
      return res.status(200).json({
        success: true,
        data: [
          {
            //getting all existing booking elements and then adding on top the total for that one booking -
            ...booking,
            totalCost: booking.days * booking.rent_per_day,
          },
        ],
      });
    } else {
      //list all bookings of the user (last option)
      const bookings = await prisma.booking.findMany({
        where: {
          user_id: userId, //user's all bookings, so grabbing the userId instead of bookingId
        },
      });

      const response = bookings.map((booking) => ({
        //spreading the existing booking items (car name, rent, days etc) and adding another paramete (totalCost) to it instead of creating an entirely new object type
        ...booking,
        totalCost: booking.days * booking.rent_per_day,
      }));

      return res.status(200).json({
        success: true,
        data: response,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  try {
    //check auth safety and user-
    if (!req.user) {
      return res.status(400).json({
        success: false,
        error: "unauthorized",
      });
    }
    //take userId from jwt middleware
    const userId = req.user.userId;

    //take bookingId from client url input
    const bookingId = Number(req.params.bookingId);

    //validate bookingId-
    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        error: "invalid user",
      });
    }

    //fetch the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "booking not found",
      });
    }

    //checking ownership-
    if (booking.user_id !== userId) {
      return res.status(400).json({
        success: false,
        error: "booking does not belong to user",
      });
    }

    //decide update items a/t assignment conditions
    const { carName, days, rentPerDay, status } = req.body;

    //either update the status, or the remaining items from above, not both

    //--updating status
    if (status) {
      if (!["booked", "completed", "cancelled"].includes(status)) {
        //if status doesnt belong to any of these three
        return res.status(400).json({
          error: "invalid status",
          success: false,
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: { status },
      });

      return res.status(200).json({
        sucess: true,
        data: {
          message: "booking status updated successfully",
          booking: {
            ...updatedBooking,
            totalCost: updatedBooking.rent_per_day * updatedBooking.days,
          },
        },
      });
    }

    //if not status, update other details -
    if (!carName || !rentPerDay || !days) {
      return res.status(400).json({
        success: false,
        error: "invalid inputs",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        rent_per_day: rentPerDay,
        days,
        car_name: carName,
      },
    });

    return res.status(200).json({
      success: true,
      message: "detail updated!",
      booking: {
        ...updateBooking,
        totalCost: updatedBooking.days * updatedBooking.rent_per_day,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "sommething went wrong",
    });
  }
}
