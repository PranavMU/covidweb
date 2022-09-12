const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');
const { tallySchema } = require('./schema');
const { json } = require('express');
const { data } = require('./data')
const data1=require("./data");

const refreshAll = async () => {
    await connection.deleteMany({})
    // console.log(connection)
    await connection.insertMany(data)
}
refreshAll()

app.get("/",(req,res)=>{//4
    connection.find({}).then((data)=> {
      res.send(data)
  
    })
  })

//   var que = aggregate([{$group: {_id:"total", recovered:{$sum:"$recovered"}}}])
  app.get("/totalRecovered",(req,res)=>{//4
    connection.aggregate([{$group: {_id:"total", recovered:{$sum:"$recovered"}}}]).then((data)=> {
      res.send(data)
  
    })
  })




  app.get("/totalActive",(req,res)=>{//4
    connection.aggregate([{$group: {_id:"total", active:{ $subtract: [ {$sum:"$infected"},{$sum:"$recovered"}]}}}]).then((data)=> {
      res.send(data)
  
    })
  })


app.get("/totalDeath",(req,res)=>{//4
    connection.aggregate([{$group: {_id:"total",death:{$sum:"$death"}}}]).then((data)=> {
      res.send(data)
  
    })
  })

  app.get("/hotspotStates",async (req,res)=>{
    try{
        let tot=[];
        const recoveredData= await data1;
        for(let i=0;i<(recoveredData.data).length;i++){
            let idx=((recoveredData.data[i].infected-recoveredData.data[i].recovered)/recoveredData.data[i].infected).toFixed(5);
            if(idx>0.1){
            tot.push(`{states:${recoveredData.data[i].state},rate: ${idx}}`);
            }
        }
        console.log(tot)
        res.json({
            data: {states:tot}
        })
    }catch(e){
        res.status(303).json({

            message:e.message
        })
    }
})
 

  app.get("/healthyStates",async (req,res)=>{
    try{
      let tot=[];
      const recoveredData= await data1;
      for(let i=0;i<(recoveredData.data).length;i++){
          let idx=((recoveredData.data[i].death)/recoveredData.data[i].infected).toFixed(5);
          if(idx<0.005){
          tot.push(`{states:${recoveredData.data[i].state},mortality: ${idx}}`);
          }
      }
      console.log(tot)
      res.json({
          data: {states:tot}
      })
  }catch(e){
      res.status(303).json({

          message:e.message
      })
  }
})



app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;