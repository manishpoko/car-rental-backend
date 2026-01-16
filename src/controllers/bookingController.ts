//logic for bookings - eg create booking update/delete booking, show all bookings etc

// get the details from req.body and req.user
// check if all items are present
// check for limits of rent and days
// calculate totalcost
// create new prisma booking with details
// return the data

import prisma from "../lib/prisma.js";
import type { Response } from "express";

import type { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

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
        totalCost: totalCost
      },
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "error creating user",
    });
  }
}
