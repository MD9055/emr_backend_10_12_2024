const express = require('express');
const {
    createNote,
    editNote,
    notetList,
    createHistoryNote,
    HistoryNoteList,
    HistoryNoteID,
    downloadNotePdf,
    deleteNote,
    diagonosisList,
    medicationList,
    cptCodeList
} = require('../controllers/notes');
const { authMiddleware } = require('../middleware/authUser');

var router = express.Router();

router.post("/add",authMiddleware, createNote);
router.get("/",authMiddleware, notetList);
router.put("/",authMiddleware, editNote);
router.post("/history",authMiddleware, createHistoryNote);
router.get("/history", authMiddleware,HistoryNoteList);
router.get("/history/:id",authMiddleware, HistoryNoteID);
router.get("/downloadpdf",authMiddleware, downloadNotePdf);
router.delete("/", authMiddleware,deleteNote);
router.get('/diagonosisList', diagonosisList )
router.get('/medicationList', medicationList )
router.get('/cptcodeList', cptCodeList )
// router.get('/recentcodeList', recentCptcodeList )

module.exports = router;
