const express = require("express");
const app = express();
const mockdata=require("../db.json")





app.get("/users", (req, res) => {
    const page=req.query.page || 1;
    const limit = req.query.limit || 3;


    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    const result={}
    if(startIndex>0){
        result.previous={
            page:page-1,
            limit:limit
        }
    }
    if(endIndex<mockdata.length){
        result.next={
            page:page+1,
            limit:limit
        }
    }
     result.results=mockdata.slice(startIndex, endIndex)


    res.status(200).json({startIndex,endIndex,result})
});
















app.listen(8080, () => {
  console.log("server started on port 3000");
});
