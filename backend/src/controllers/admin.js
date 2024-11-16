import asyncHandler from "express-async-handler";
import ExcelJS from "exceljs";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getAdminBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("client", "name email")
    .populate("interpreter", "name email hourlyRate")
    .populate("language", "name code")
    .sort("-createdAt");
  res.json(bookings);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .populate("languages", "name code")
    .select("-password");
  res.json(users);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { hourlyRate, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(isActive !== undefined && { isActive }),
    },
    { new: true }
  )
    .populate("languages", "name code")
    .select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

export const getClientCharges = asyncHandler(async (req, res) => {
  const { clientId, startDate, endDate } = req.query;

  const bookings = await Booking.find({
    client: clientId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: "completed",
  })
    .populate({
      path: "interpreter",
      select: "name email hourlyRate",
    })
    .populate("language", "name")
    .lean();

  console.log("Found bookings:", bookings);

  const charges = bookings.map((booking) => {
    const startHour = parseInt(booking.startTime);
    const endHour = parseInt(booking.endTime);
    const hours = endHour - startHour;
    const rate = booking.interpreter?.hourlyRate || 0;
    const amount = hours * rate;

    return {
      date: booking.date,
      interpreter: booking.interpreter?.name || "Unassigned",
      language: booking.language.name,
      hours,
      rate,
      amount,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });

  console.log("Processed charges:", charges);

  const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const totalHours = charges.reduce((sum, charge) => sum + charge.hours, 0);
  const averageRate = charges.length > 0 ? totalAmount / totalHours : 0;

  res.json({
    charges,
    totalAmount,
    totalHours,
    averageRate,
    bookingCount: charges.length,
  });
});

export const getInterpreterEarnings = asyncHandler(async (req, res) => {
  const { interpreterId, startDate, endDate } = req.query;

  // Get interpreter with hourly rate
  const interpreter = await User.findById(interpreterId);
  if (!interpreter) {
    res.status(404);
    throw new Error("Interpreter not found");
  }

  const bookings = await Booking.find({
    interpreter: interpreterId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: "completed",
  })
    .populate("client", "name email")
    .populate("language", "name")
    .lean();

  console.log("Found interpreter bookings:", bookings);

  const earnings = bookings.map((booking) => {
    const startHour = parseInt(booking.startTime);
    const endHour = parseInt(booking.endTime);
    const hours = endHour - startHour;
    const rate = interpreter.hourlyRate || 0;
    const amount = hours * rate;

    return {
      date: booking.date,
      client: booking.client?.name || "Unknown",
      language: booking.language.name,
      hours,
      rate,
      amount,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });

  console.log("Processed earnings:", earnings);

  const totalAmount = earnings.reduce(
    (sum, earning) => sum + earning.amount,
    0
  );
  const totalHours = earnings.reduce((sum, earning) => sum + earning.hours, 0);
  const averageRate = earnings.length > 0 ? totalAmount / totalHours : 0;

  res.json({
    earnings,
    totalAmount,
    totalHours,
    averageRate,
    bookingCount: earnings.length,
    hourlyRate: interpreter.hourlyRate,
  });
});

const generateExcel = async (data, type) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Financial Report");

  // Add headers
  worksheet.addRow([
    "Date",
    type === "client" ? "Interpreter" : "Client",
    "Language",
    "Hours",
    "Rate (£)",
    "Amount (£)",
    "Start Time",
    "End Time",
  ]);

  // Add data
  const items = type === "client" ? data.charges : data.earnings;
  items.forEach((item) => {
    worksheet.addRow([
      new Date(item.date).toLocaleDateString(),
      type === "client" ? item.interpreter : item.client,
      item.language,
      item.hours,
      item.rate,
      item.amount,
      item.startTime,
      item.endTime,
    ]);
  });

  // Add summary
  worksheet.addRow([]);
  worksheet.addRow(["Total Hours", "", "", data.totalHours]);
  worksheet.addRow(["Total Amount (£)", "", "", "", "", data.totalAmount]);
  worksheet.addRow(["Number of Bookings", "", "", data.bookingCount]);
  if (data.averageRate) {
    worksheet.addRow(["Average Rate (£/hour)", "", "", "", data.averageRate]);
  }

  // Style the worksheet
  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 20;
  worksheet.getColumn(3).width = 15;
  worksheet.getColumn(4).width = 10;
  worksheet.getColumn(5).width = 10;
  worksheet.getColumn(6).width = 12;
  worksheet.getColumn(7).width = 12;
  worksheet.getColumn(8).width = 12;

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  return workbook;
};

const generateCSV = (data, type) => {
  const items = type === "client" ? data.charges : data.earnings;
  const headers = [
    "Date",
    type === "client" ? "Interpreter" : "Client",
    "Language",
    "Hours",
    "Rate (£)",
    "Amount (£)",
    "Start Time",
    "End Time",
  ].join(",");

  const rows = items.map((item) =>
    [
      new Date(item.date).toLocaleDateString(),
      type === "client" ? item.interpreter : item.client,
      item.language,
      item.hours,
      item.rate,
      item.amount,
      item.startTime,
      item.endTime,
    ].join(",")
  );

  const summary = [
    "",
    `Total Hours,,,${data.totalHours}`,
    `Total Amount (£),,,,,${data.totalAmount}`,
    `Number of Bookings,,,${data.bookingCount}`,
    data.averageRate ? `Average Rate (£/hour),,,,${data.averageRate}` : "",
  ];

  return [headers, ...rows, ...summary].join("\n");
};

export const exportFinancialReport = asyncHandler(async (req, res) => {
  const { type, userId, startDate, endDate, format } = req.query;

  let data;
  if (type === "client") {
    const bookings = await Booking.find({
      client: userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: "completed",
    })
      .populate({
        path: "interpreter",
        select: "name email hourlyRate",
      })
      .populate("language", "name")
      .lean();

    const charges = bookings.map((booking) => {
      const startHour = parseInt(booking.startTime);
      const endHour = parseInt(booking.endTime);
      const hours = endHour - startHour;
      const rate = booking.interpreter?.hourlyRate || 0;
      const amount = hours * rate;

      return {
        date: booking.date,
        interpreter: booking.interpreter?.name || "Unassigned",
        language: booking.language.name,
        hours,
        rate,
        amount,
        startTime: booking.startTime,
        endTime: booking.endTime,
      };
    });

    const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);
    const totalHours = charges.reduce((sum, charge) => sum + charge.hours, 0);
    const averageRate = charges.length > 0 ? totalAmount / totalHours : 0;

    data = {
      charges,
      totalAmount,
      totalHours,
      averageRate,
      bookingCount: charges.length,
    };
  } else {
    // Similar logic for interpreter earnings...
    // ... (copy the logic from getInterpreterEarnings)
  }

  if (format === "excel") {
    const workbook = await generateExcel(data, type);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=financial-report-${type}-${startDate}-${endDate}.xlsx`
    );
    await workbook.xlsx.write(res);
  } else if (format === "csv") {
    const csv = generateCSV(data, type);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=financial-report-${type}-${startDate}-${endDate}.csv`
    );
    res.send(csv);
  } else {
    res.json(data);
  }
});
