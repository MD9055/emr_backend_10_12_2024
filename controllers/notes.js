const NOTES = require("../models/notesModal");
const Diagonosis = require("../models/diagonosis");
const Medication = require("../models/medication");
const cptCode = require("../models/cptCode");
const HistoryNote = require("../models/historyNote");
const recentcptCode = require("../models/recentCptcode");
const  constant  = require("../utils/constant");
const mongoose = require("mongoose");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const FunctoryFunctions = require('../middleware/factoryFunctions');
const EncryptionService = require("../middleware/EncryptionService");



async function createNote(req, res) {
    const responseHandler = new FunctoryFunctions(res);
  
    try {
      let { data_id, name, description } = req.body;
  
      let notesModal = await new NOTES({
        userId: req.user.userId,
        data_id: data_id,
        name: name,
        description: description,
      });
  
      let savePatient = await notesModal.save();
      console.log(`notesModal`, savePatient);
  
      if (savePatient && savePatient._id) {
        return responseHandler.responseSend(
          constant.SUCCESS_CODE,
          "Notes created successfully.",
          savePatient
        );
      } else {
        return responseHandler.responseSend(
          constant.SUCCESS_CODE,
          constant.ADD_FAILED,
          null
        );
      }
    } catch (err) {
      console.log(err);
      return responseHandler.responseSend(
        constant.ERROR_CODE,
        "Failed to create notes.",
        null
      );
    }
}
  
async function notetList(req, res) {
    const responseHandler = new FunctoryFunctions(res);
    try {
      const { data_id } = req.query;
      console.log(`req.query`, req.query);
      const patients = await NOTES.find({ data_id: data_id, userId: req.user.userId });
      return responseHandler.responseSend(
        200, // Status code
        "Notes fetched successfully.",
        patients // Data
      );
    } catch (err) {
      console.log(err);
      return responseHandler.responseSend(
        500, // Status code
        "Internal server error.", // Error message
        null // No data in case of error
      );
    }
}
  
async function editNote(req, res) {
    const responseHandler = new FunctoryFunctions(res);
  
    try {
      let data = {};
      if (req.body.name !== "" && req.body.name) data.name = req.body.name;
      if (req.body.description !== "" && req.body.description)
        data.description = req.body.description;
  
      NOTES.findByIdAndUpdate(
        req.query.id,
        { $set: data },
        { new: true } // Return the updated document
      )
        .then((updatedDocument) => {
          if (updatedDocument) {
            return responseHandler.responseSend(
              constant.SUCCESS_CODE, // Status code
              "Notes updated successfully.", // Success message
              updatedDocument // Updated document
            );
          } else {
            return responseHandler.responseSend(
              constant.SUCCESS_CODE, // Status code
              "Failed to update notes.", // Failure message
              null // No data
            );
          }
        })
        .catch((err) => {
          console.error(`Error updating document: ${err}`);
          return responseHandler.responseSend(
            constant.ERROR_CODE, // Error status code
            "Error occurred while updating the note.", // Error message
            null // No data
          );
        });
    } catch (err) {
      console.error(`Error in editNote function: ${err}`);
      return responseHandler.responseSend(
        constant.ERROR_CODE, // Error status code
        "Unexpected error occurred.", // Error message
        null // No data
      );
    }
}
  
  async function createHistoryNote(req, res) {
    const responseHandler = new FunctoryFunctions(res);
  
    try {
      let {
        user_id,
        chief_complaint,
        history_illness,
        ros,
        social_history,
        allergies,
        medication,
        physical_exam,
        physical_details,
        diagnosis,
        plan,
        cptCode,
        medicationList
      } = req.body;
  
      // Create a new HistoryNote document
      let notesModal = new HistoryNote({
        userId: user_id,
        doctor_id: req.user.userId,
        chief_complaint: chief_complaint,
        history_illness: history_illness,
        ros: ros,
        social_history: social_history,
        allergies: allergies,
        medication: medication,
        physical_exam: physical_exam,
        physical_details: physical_details,
        diagnosis: diagnosis,
        plan: plan,
        cptCode: cptCode,
        medicationList: medicationList
      });
  
      let savePatient = await notesModal.save();
  
      if (savePatient && savePatient._id) {
        // Handle `cptCode` entries
        if (Array.isArray(cptCode)) {
          for (let code of cptCode) {
            let cptEntry = new recentcptCode({
              code_id: code,
              doctor_id: req.user.userId,
            });
            await cptEntry.save();
          }
  
          // Maintain only the 10 most recent CPT codes
          let cptCount = await recentcptCode.countDocuments({ doctor_id: req.user.userId });
          if (cptCount > 10) {
            let excessCount = cptCount - 10;
  
            let excessDocuments = await recentcptCode
              .find({ doctor_id: req.user.userId })
              .sort({ createdAt: 1 }) // Oldest entries first
              .limit(excessCount)
              .select('_id'); // Select only `_id` fields
  
            let excessIds = excessDocuments.map((doc) => doc._id);
  
            // Delete excess documents
            await recentcptCode.deleteMany({ _id: { $in: excessIds } });
          }
        }
  
        return responseHandler.responseSend(
          constant.SUCCESS_CODE, // Status code
          "Notes saved successfully.", // Success message
          savePatient // Data to return
        );
      } else {
        return responseHandler.responseSend(
          constant.SUCCESS_CODE, // Status code
          "Failed to save notes.", // Failure message
          null // No data
        );
      }
    } catch (err) {
      console.error(err);
  
      return responseHandler.responseSend(
        constant.ERROR_CODE, // Error status code
        "An error occurred while saving the notes.", // Error message
        null // No data
      );
    }
  }
  

  async function HistoryNoteList(req, res) {
    const responseHandler = new FunctoryFunctions(res);
  
    try {
      const { doctor_id, user_id } = req.query;
  
      const patients = await HistoryNote.find({ userId: user_id })
        .populate('userId', 'firstName lastName') // Populate user details
        .populate('doctor_id', 'firstName lastName'); // Populate doctor details
  
      return responseHandler.responseSend(
        200, // Status code
        "History notes fetched successfully.", // Success message
        patients // Data to return
      );
    } catch (err) {
      console.error(err);
  
      return responseHandler.responseSend(
        500, // Error status code
        "An error occurred while fetching history notes.", // Error message
        null // No data
      );
    }
  }
  

  async function HistoryNoteID(req, res) {
    const responseHandler = new FunctoryFunctions(res);
  
    try {
      const historyNoteId = new mongoose.Types.ObjectId(req.params.id);
  
      const historyNote = await HistoryNote.aggregate([
        { $match: { _id: historyNoteId } },
        {
          $lookup: {
            from: 'cptcodes', // The collection name in your database
            localField: 'cptCode',
            foreignField: '_id',
            as: 'cptCodeDetails',
          },
        },
      ]);
  
      if (!historyNote.length) {
        return responseHandler.responseSend(
          404, // Status code for not found
          "HistoryNote not found.", // Error message
          null // No data
        );
      }
  
      return responseHandler.responseSend(
        200, // Status code
        "HistoryNote fetched successfully.", // Success message
        historyNote[0] // The fetched history note
      );
    } catch (err) {
      console.error(err);
  
      return responseHandler.responseSend(
        500, // Error status code
        "An error occurred while fetching the history note.", // Error message
        null // No data
      );
    }
  }
  

function formatTimestamp(timestamp) {
  // Create a new Date object from the timestamp
  const date = new Date(timestamp);

  // Define options for formatting the date and time
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  // Format the date using toLocaleString
  return date.toLocaleString('en-US', options);
}

function formatDate(timestamp) {
  // Create a new Date object from the timestamp
  const date = new Date(timestamp);

  // Get the day, month, and year from the date object
  const month = date.getUTCMonth() + 1; // getUTCMonth() returns month from 0-11, so add 1
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  // Return the formatted date string in MM/DD/YYYY format
  return `${month}/${day}/${year}`;
}

async function downloadNotePdf(req, res) {
    const responseHandler = new FunctoryFunctions(res);
  
    try {
      const historyNoteId = req.query.id; // Assuming the ID is passed as a URL parameter
      const historyNote = await HistoryNote.findById(historyNoteId)
        .populate('userId', 'firstName lastName dob')
        .exec();
      console.log(`historyNote`, historyNote);
      if (!historyNote) {
        return responseHandler.responseSend(
          404, // Not Found
          'History note not found.', // Error message
          null // No data
        );
      }
  
      const encryptionService = new EncryptionService();
      // Extract and format data for the PDF
      const name = `${encryptionService.decrypt(historyNote.userId.firstName)} 
      ${encryptionService.decrypt(historyNote.userId.lastName)}`;
      const dob = formatDate(historyNote.userId.dob);
      const current_date = formatTimestamp(historyNote.createdAt);
      const chief_complaint = historyNote.chief_complaint || 'N/A';
      const HPI = historyNote.history_illness || 'N/A';
      const ROS = historyNote.ros || 'N/A';
      const PMH = historyNote.diagnosis
        ? historyNote.diagnosis.map(d => d.desc).join('</br>')
        : 'N/A';
      const social_history = historyNote.social_history || 'N/A';
      const family_history = historyNote.social_history || 'N/A';
      const Allergies = historyNote.allergies || 'N/A';
      const medication = 'N/A'; // Placeholder if not available
      const physical_exam = historyNote.physical_details || 'N/A';
      const a_p = historyNote.plan || 'N/A';
  
      // Path to the HTML template
      const htmlTemplatePath = path.join(__dirname, '../views/notepdf.html');
  
      // Read the HTML template
      const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');
      const html = htmlTemplate
        .replace('{{name}}', name)
        .replace('{{dob}}', dob)
        .replace('{{name1}}', name)
        .replace('{{dob1}}', dob)
        .replace('{{current_date}}', current_date)
        .replace('{{chief_complaint}}', chief_complaint)
        .replace('{{HPI}}', HPI)
        .replace('{{ROS}}', ROS)
        .replace('{{PMH}}', PMH)
        .replace('{{social_history}}', social_history)
        .replace('{{family_history}}', family_history)
        .replace('{{Allergies}}', Allergies)
        .replace('{{medication}}', medication)
        .replace('{{bp}}', 'Test Data') // Replace with actual data if available
        .replace('{{pulse}}', 'Test Data') // Replace with actual data if available
        .replace('{{RR}}', 'Test Data') // Replace with actual data if available
        .replace('{{physical_exam}}', physical_exam)
        .replace('{{a_p}}', a_p);
       console.log(`historyNote- 1`, html);
  
      // Generate PDF
      pdf.create(html, { format: 'A4' }).toBuffer((err, buffer) => {
        if (err) {
          console.error('Error generating PDF:', err);
          return responseHandler.responseSend(
            500, // Internal Server Error
            'Error generating PDF.', // Error message
            null // No data
          );
        }
  
        // Send the PDF as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        res.send(buffer);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
  
      return responseHandler.responseSend(
        500, // Internal Server Error
        'Error generating PDF.', // Error message
        null // No data
      );
    }
  }

  async function deleteNote(req, res) {
    const responseHandler = new FunctoryFunctions(res);
  
    try {
      const { id } = req.query; // Assuming the note ID is passed as a query parameter
      console.log(`req.query`, req.query);
  
      // Find and delete the note by _id
      const deletedNote = await NOTES.findByIdAndDelete(id);
  
      if (!deletedNote) {
        return responseHandler.responseSend(
          404, // Not Found
          "Note not found.", // Error message
          null // No data
        );
      }
  
      return responseHandler.responseSend(
        200, // Success
        "Note deleted successfully.", // Success message
        deletedNote // Include the deleted note's data
      );
    } catch (err) {
      console.error(err);
  
      return responseHandler.responseSend(
        500, // Internal Server Error
        "An error occurred while deleting the note.", // Error message
        null // No data
      );
    }
  }
  
  async function diagonosisList(req, res) {
    const responseHandler = new FunctoryFunctions(res);
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
    
        const query = {};
       
        if (search) {
            //query.code = { $regex: search, $options: 'i' }; 
            query.desc = { $regex: search, $options: 'i' }; // Case-insensitive regex search
        }
    
        const totalCount = await Diagonosis.countDocuments(query);
    
        const result = await Diagonosis.find(query)
          .select('_id code desc createdAt updatedAt')
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({ createdAt: 1 });
    
        if (result.length === 0) {
          return responseHandler.responseSend(
            200, // Status code
            "Notes fetched successfully.",
            {data: [],
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(totalCount / limit) ? page + 1 : null,
            currentCount: result.length}
          );
        }
    
        return responseHandler.responseSend(
          200, // Status code
            "Notes fetched successfully.",
          {
            data: result,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(totalCount / limit) ? page + 1 : null,
            currentCount: result.length
          }
        );
    
      } catch (err) {
        console.error(err);
        return responseHandler.responseSend(
            500, // Internal Server Error
            "An error occurred while deleting the note.", // Error message
            null // No data
          );
      }
}


async function medicationList(req, res) {
    const responseHandler = new FunctoryFunctions(res);
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
    
        const query = {};
       
        if (search) {
            query.PsnDrugDescription = { $regex: search, $options: 'i' }; // Case-insensitive regex search
        }
    
        const totalCount = await Medication.countDocuments(query);
    
        const result = await Medication.find(query)
          .select('_id PsnDrugDescription FullGenericName')
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({ createdAt: 1 });
    
        if (result.length === 0) {
          return responseHandler.responseSend(
            200, // Status code
            "Notes fetched successfully.",
            {data: [],
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(totalCount / limit) ? page + 1 : null,
            currentCount: result.length}
          );
        }
    
        return responseHandler.responseSend(
          200, // Status code
            "Notes fetched successfully.",
          {
            data: result,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(totalCount / limit) ? page + 1 : null,
            currentCount: result.length
          }
        );
    
      } catch (err) {
        console.error(err);
        return responseHandler.responseSend(
            500, // Internal Server Error
            "An error occurred while deleting the note.", // Error message
            null // No data
          );
      }
}

async function cptCodeList(req, res) {
  const responseHandler = new FunctoryFunctions(res);
  try {
      let { page, limit, search } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
  
      const query = {};
     
      if (search) {
          query.PsnDrugDescription = { $regex: search, $options: 'i' }; // Case-insensitive regex search
      }
  
      const totalCount = await cptCode.countDocuments(query);
  
      const result = await cptCode.find(query)
        .select('_id code desc createdAt updatedAt')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: 1 });
  
      if (result.length === 0) {
        return responseHandler.responseSend(
          200, // Status code
          "Notes fetched successfully.",
          {data: [],
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(totalCount / limit) ? page + 1 : null,
          currentCount: result.length}
        );
      }
  
      return responseHandler.responseSend(
        200, // Status code
          "Notes fetched successfully.",
        {
          data: result,
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < Math.ceil(totalCount / limit) ? page + 1 : null,
          currentCount: result.length
        }
      );
  
    } catch (err) {
      console.error(err);
      return responseHandler.responseSend(
          500, // Internal Server Error
          "An error occurred while deleting the note.", // Error message
          null // No data
        );
    }
}

module.exports = {
    createNote,
    notetList,
    editNote,
    createHistoryNote,
    HistoryNoteList,
    HistoryNoteID,
    downloadNotePdf,
    deleteNote,
    diagonosisList,
    medicationList,
    cptCodeList
}