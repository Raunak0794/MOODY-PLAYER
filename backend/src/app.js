const express=require('express')

const songRoute=require('./routes/song.routes')
const cors=require('cors')


const app=express()
app.use(express.json())
app.use('/songs',songRoute)
app.use(cors())
app.get("/songs", (req, res) => {
  const { mood } = req.query;
  res.json({
    songs: [
      { title: "Happy Song", artist: "DJ Smile", url: "song_url" },
      { title: "Cheerful Beats", artist: "Joy Maker", url: "song_url" },
    ],
  });
});



module.exports=app;