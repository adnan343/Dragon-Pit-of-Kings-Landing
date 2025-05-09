import Dragon from "../models/dragon.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";


export const removeDragon = async (req, res) => {
  const { userId, dragonId } = req.body;

  // Validate input
  if (!userId || !dragonId) {
    return res
        .status(400)
        .json({ success: false, msg: "User ID and Dragon ID are required." });
  }

  // Validate IDs format
  if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(dragonId)
  ) {
    return res.status(400).json({ success: false, msg: "Invalid ID format." });
  }

  try {
    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found." });
    }

    // Check if the user is a Dragon Rider (case insensitive)
    if (user.userType.toLowerCase() !== "dragon rider") {
      return res
          .status(403)
          .json({
            success: false,
            msg: "Only Dragon Riders can acquire dragons.",
          });
    }

    // Find the dragon
    const dragon = await Dragon.findById(dragonId);
    if (!dragon) {
      return res.status(404).json({ success: false, msg: "Dragon not found." });
    }

    // Check if the dragon is already acquired
    if (dragon.rider === userId) {
      dragon.rider = null;
      user.acquiredDragons.remove(dragonId);
      dragon.save();
      user.save();
      return res
          .status(409)
          .json({ success: True, msg: "Successfully removed acquisation." });
    }

    // Assign the dragon to the user
    // dragon.rider = userId;
    // user.acquiredDragons.push(dragonId);
    // console.log(dragonId);
    // console.log(user.acquiredDragons);
    // await dragon.save();
    // await user.save();

    // res.status(200).json({
    //   success: true,
    //   msg: "Dragon successfully acquired.",
    //   data: { dragon, rider: user.username },
    // });
  } catch (error) {
    console.error("Error acquiring dragon: ", error.message);
    res.status(500).json({ success: false, msg: "Internal Server Error." });
  }
};

export const acquireDragon = async (req, res) => {
  const { userId, dragonId } = req.body;

  // Validate input
  if (!userId || !dragonId) {
    return res
      .status(400)
      .json({ success: false, msg: "User ID and Dragon ID are required." });
  }

  // Validate IDs format
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(dragonId)
  ) {
    return res.status(400).json({ success: false, msg: "Invalid ID format." });
  }

  try {
    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found." });
    }

    // Check if the user is a Dragon Rider (case insensitive)
    if (user.userType.toLowerCase() !== "dragon rider") {
      return res
        .status(403)
        .json({
          success: false,
          msg: "Only Dragon Riders can acquire dragons.",
        });
    }

    // Find the dragon
    const dragon = await Dragon.findById(dragonId);
    if (!dragon) {
      return res.status(404).json({ success: false, msg: "Dragon not found." });
    }

    // Check if the dragon is already acquired
    if (dragon.rider) {
      return res
        .status(409)
        .json({ success: false, msg: "This dragon is already acquired." });
    }

    // Assign the dragon to the user
    dragon.rider = userId;
    user.acquiredDragons.push(dragonId);
    console.log(dragonId);
    console.log(user.acquiredDragons);
    await dragon.save();
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Dragon successfully acquired.",
      data: { dragon, rider: user.username },
    });
  } catch (error) {
    console.error("Error acquiring dragon: ", error.message);
    res.status(500).json({ success: false, msg: "Internal Server Error." });
  }
};
