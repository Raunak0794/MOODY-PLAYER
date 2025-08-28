const express = require('express')
const multer = require('multer')
const uploadfile = require('../service/storage.service')
const Song = require('../models/song.model')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })


const auth = require("../middleware/auth");

// Protect upload API



// POST /songs → add new song
router.post('/', upload.single("audio"), async (req, res) => {
    try {
        let audioUrl = null
        if (req.file) {
            const result = await uploadfile(req.file)
            audioUrl = result.url
        }

        const newSong = new Song({
            title: req.body.title,
            artist: req.body.artist,
            mood: req.body.mood.toLowerCase(), // store lowercase
            audio: audioUrl
        })

        const savedSong = await newSong.save()

        res.status(201).json({
            message: 'Song created successfully',
            song: savedSong
        })
    } catch (err) {
        console.error("Error in /songs route:", err)
        res.status(500).json({ error: err.message })
    }
})

// GET /songs?mood=happy → fetch songs by mood
router.get('/', async (req, res) => {
    try {
        const { mood } = req.query
        let songs

        if (mood) {
            songs = await Song.find({ mood: mood.toLowerCase() })
        } else {
            songs = await Song.find()
        }

        res.json({ songs })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
