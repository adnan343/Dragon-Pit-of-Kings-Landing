import Fight from "../models/fight.model.js";
import Dragon from "../models/dragon.model.js";
import User from "../models/user.model.js";

// Check if user is the rider of a dragon
const isUserDragonRider = async (userId, dragonId) => {
  const dragon = await Dragon.findById(dragonId);
  return (
    dragon && dragon.rider && dragon.rider.toString() === userId.toString()
  );
};

// Initiate a new fight between dragons
export const initiateFight = async (req, res) => {
  try {
    const {
      challengerDragonId,
      opponentDragonId,
      riderId,
      location,
      notes,
    } = req.body;

    // Validate required fields
    if (!challengerDragonId || !opponentDragonId || !riderId) {
      return res.status(400).json({
        message:
          "Missing required fields: challengerDragonId, opponentDragonId, and riderId are required",
      });
    }

    // Check if both dragons exist
    const [challengerDragon, opponentDragon] = await Promise.all([
      Dragon.findById(challengerDragonId),
      Dragon.findById(opponentDragonId),
    ]);

    if (!challengerDragon || !opponentDragon) {
      return res.status(404).json({ message: "One or both dragons not found" });
    }

    // Verify user is the rider of the challenger dragon
    if (!(await isUserDragonRider(riderId, challengerDragonId))) {
      return res.status(403).json({
        message: "Only dragon riders can initiate fights with their dragons",
      });
    }

    // Verify opponent dragon has a rider
    if (!opponentDragon.rider) {
      return res.status(400).json({
        message: "Cannot challenge a dragon without a rider",
      });
    }

    // Create new fight
    const newFight = new Fight({
      challenger: {
        dragon: challengerDragonId,
        rider: riderId,
      },
      opponent: {
        dragon: opponentDragonId,
        rider: opponentDragon.rider,
      },
      fightDetails: {
        location: location || "Dragon Arena",
        notes: notes || "Standard dragon fight",
      },
    });

    await newFight.save();

    return res.status(201).json({
      success: true,
      message: "Dragon fight initiated successfully",
      fight: newFight,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to initiate fight",
      error: error.message,
    });
  }
};

// Complete a fight and record results
export const completeFight = async (req, res) => {
  try {
    const {
      fightId,
      winnerDragonId,
      isDraw,
      challengerScore,
      opponentScore,
      rounds,
      riderId,
    } = req.body;

    if (!fightId) {
      return res.status(400).json({ message: "Fight ID is required" });
    }

    // Find the fight
    const fight = await Fight.findById(fightId);
    if (!fight) {
      return res.status(404).json({ message: "Fight not found" });
    }

    // Check if fight is already completed
    if (fight.status === "completed") {
      return res
        .status(400)
        .json({ message: "This fight is already completed" });
    }

    // If riderId is provided, verify user is one of the riders involved
    if (riderId) {
      const isUserInvolved =
        fight.challenger.rider.toString() === riderId.toString() ||
        fight.opponent.rider.toString() === riderId.toString();

      if (!isUserInvolved) {
        return res
          .status(403)
          .json({
            message: "Only riders involved in the fight can complete it",
          });
      }
    }

    // Process fight result
    if (isDraw) {
      // It's a draw
      fight.result.isDraw = true;
      fight.result.winner = null;
      fight.result.loser = null;
    } else if (winnerDragonId) {
      // There's a winner
      const isWinnerInFight =
        fight.challenger.dragon.toString() === winnerDragonId ||
        fight.opponent.dragon.toString() === winnerDragonId;

      if (!isWinnerInFight) {
        return res
          .status(400)
          .json({
            message: "Winner dragon must be one of the dragons in the fight",
          });
      }

      // Set winner and loser
      fight.result.winner = winnerDragonId;
      fight.result.loser =
        fight.challenger.dragon.toString() === winnerDragonId
          ? fight.opponent.dragon
          : fight.challenger.dragon;
      fight.result.isDraw = false;
    } else {
      return res
        .status(400)
        .json({ message: "Either winnerDragonId or isDraw must be provided" });
    }

    // Update fight details
    if (rounds) fight.fightDetails.rounds = rounds;

    if (challengerScore !== undefined && opponentScore !== undefined) {
      fight.result.winnerScore = Math.max(challengerScore, opponentScore);
      fight.result.loserScore = Math.min(challengerScore, opponentScore);
    }

    fight.status = "completed";
    await fight.save();

    // Update dragon fight records
    await updateDragonFightRecords(fight);

    return res.status(200).json({
      success: true,
      message: "Fight completed successfully",
      fight,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to complete fight",
      error: error.message,
    });
  }
};

// Helper function to update dragon fight records
const updateDragonFightRecords = async (fight) => {
  try {
    // Get the challenger and opponent dragons
    const [challengerDragon, opponentDragon] = await Promise.all([
      Dragon.findById(fight.challenger.dragon),
      Dragon.findById(fight.opponent.dragon),
    ]);

    // Skip if dragons don't exist
    if (!challengerDragon || !opponentDragon) return;

    // Ensure fighting property exists
    if (!challengerDragon.fighting) challengerDragon.fighting = {};
    if (!opponentDragon.fighting) opponentDragon.fighting = {};

    // Update stats based on fight result
    if (fight.result.isDraw) {
      // It's a draw
      challengerDragon.fighting.draws =
        (challengerDragon.fighting.draws || 0) + 1;
      opponentDragon.fighting.draws = (opponentDragon.fighting.draws || 0) + 1;
    } else if (fight.result.winner) {
      // Someone won
      if (fight.result.winner.toString() === challengerDragon._id.toString()) {
        // Challenger won
        challengerDragon.fighting.wins =
          (challengerDragon.fighting.wins || 0) + 1;
        opponentDragon.fighting.losses =
          (opponentDragon.fighting.losses || 0) + 1;
      } else {
        // Opponent won
        opponentDragon.fighting.wins = (opponentDragon.fighting.wins || 0) + 1;
        challengerDragon.fighting.losses =
          (challengerDragon.fighting.losses || 0) + 1;
      }
    }

    // Save both dragons
    await Promise.all([challengerDragon.save(), opponentDragon.save()]);
  } catch (error) {
    console.error("Error updating dragon fight records:", error);
  }
};

// Get fights for a specific dragon
export const getDragonFights = async (req, res) => {
  try {
    const { dragonId } = req.params;

    // Verify dragon exists
    const dragon = await Dragon.findById(dragonId);
    if (!dragon) {
      return res.status(404).json({ message: "Dragon not found" });
    }

    // Find all fights involving the dragon
    const fights = await Fight.find({
      $or: [{ "challenger.dragon": dragonId }, { "opponent.dragon": dragonId }],
    })
      .populate("challenger.dragon", "name size age image")
      .populate("challenger.rider", "username")
      .populate("opponent.dragon", "name size age image")
      .populate("opponent.rider", "username")
      .sort({ fightDate: -1 });

    return res.status(200).json({
      success: true,
      count: fights.length,
      fights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dragon fights",
      error: error.message,
    });
  }
};

// Get all fights
export const getAllFights = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    // Apply filters if provided
    if (status) query.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get fights
    const fights = await Fight.find(query)
      .populate("challenger.dragon", "name size age image")
      .populate("challenger.rider", "username")
      .populate("opponent.dragon", "name size age image")
      .populate("opponent.rider", "username")
      .populate("result.winner", "name")
      .populate("result.loser", "name")
      .sort({ fightDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Fight.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: fights.length,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
      fights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve fights",
      error: error.message,
    });
  }
};

// Get fight statistics for a dragon
export const getDragonFightStats = async (req, res) => {
  try {
    const { dragonId } = req.params;

    // Verify dragon exists
    const dragon = await Dragon.findById(dragonId);
    if (!dragon) {
      return res.status(404).json({ message: "Dragon not found" });
    }

    // Initialize fighting stats if needed
    const fighting = dragon.fighting || { wins: 0, losses: 0, draws: 0 };

    // Calculate total and win rate
    const totalFights =
      (fighting.wins || 0) + (fighting.losses || 0) + (fighting.draws || 0);
    const winRate =
      totalFights > 0 ? ((fighting.wins / totalFights) * 100).toFixed(2) : 0;

    // Get last fight
    const lastFight = await Fight.findOne({
      $or: [{ "challenger.dragon": dragonId }, { "opponent.dragon": dragonId }],
      status: "completed",
    })
      .sort({ fightDate: -1 })
      .limit(1)
      .populate("challenger.dragon", "name")
      .populate("opponent.dragon", "name")
      .populate("result.winner", "name")
      .populate("result.loser", "name");

    // Return stats
    return res.status(200).json({
      success: true,
      stats: {
        wins: fighting.wins || 0,
        losses: fighting.losses || 0,
        draws: fighting.draws || 0,
        totalFights,
        winRate: `${winRate}%`,
        lastFight: lastFight || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dragon fight statistics",
      error: error.message,
    });
  }
};

// Cancel a pending fight
export const cancelFight = async (req, res) => {
  try {
    const { fightId } = req.params;
    const { riderId } = req.body;

    // Find the fight
    const fight = await Fight.findById(fightId);
    if (!fight) {
      return res.status(404).json({ message: "Fight not found" });
    }

    // Check if fight is already completed or cancelled
    if (fight.status !== "pending") {
      return res
        .status(400)
        .json({
          message: `Cannot cancel a fight that is already ${fight.status}`,
        });
    }

    // If riderId provided, verify user is one of the riders involved
    if (riderId) {
      const isUserInvolved =
        fight.challenger.rider.toString() === riderId.toString() ||
        fight.opponent.rider.toString() === riderId.toString();

      if (!isUserInvolved) {
        return res
          .status(403)
          .json({ message: "Only riders involved in the fight can cancel it" });
      }
    }

    // Cancel the fight
    fight.status = "cancelled";
    await fight.save();

    return res.status(200).json({
      success: true,
      message: "Fight cancelled successfully",
      fight,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel fight",
      error: error.message,
    });
  }
};

export const getFightParticipants = async (req, res) => {
  try {
    const { fightId } = req.params;

    // Fetch all fights from the external API
    const response = await fetch("http://localhost:3000/api/fights");
    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve fights from external API",
      });
    }

    // Find the fight by ID
    const fight = data.fights.find((f) => f._id === fightId);
    if (!fight) {
      return res
        .status(404)
        .json({ success: false, message: "Fight not found" });
    }

    // Extract participant IDs
    const challengerDragonId = fight.challenger?.dragon?._id;
    const challengerRiderId = fight.challenger?.rider?._id;
    const opponentDragonId = fight.opponent?.dragon?._id;
    const opponentRiderId = fight.opponent?.rider?._id;

    return res.status(200).json({
      success: true,
      participants: {
        challenger: {
          dragonId: challengerDragonId,
          riderId: challengerRiderId,
        },
        opponent: {
          dragonId: opponentDragonId,
          riderId: opponentRiderId,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve fight participants",
      error: error.message,
    });
  }
};
