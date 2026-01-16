//logic for bookings - eg create booking update/delete booking, show all bookings etc

// get the details from req.body and req.user
// check if all items are present
// check for limits of rent and days
// calculate totalcost
// create new prisma booking with details
// return the data
import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../middlewares/authMiddleware.js";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "unauthorized",
      });
    }
    const { carName, days, rentPerDay } = req.body;
    const userId = req.user.userId;

    if (!carName || !rentPerDay || !days) {
      return res.status(400).json({
        success: false,
        error: "invaid inputs",
      });
    }
    if (days > 365 || rentPerDay > 2000) {
      return res.status(400).json({
        success: false,
        error: "invalid inputs",
      });
    }
    const totalCost = days * rentPerDay;

    const newBooking = await prisma.booking.create({
      data: {
        user_id: userId,
        car_name: carName,
        days: days,
        rent_per_day: rentPerDay,
        status: "booked",
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        message: "booking created successfully",
        bookingId: newBooking.id,
        totalCost,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "something went wrong :(",
    });
  }
}
