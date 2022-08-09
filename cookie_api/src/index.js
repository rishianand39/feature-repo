import express from "express";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv'
dotenv.config()
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan);

const users = [
  {
    id: "1",
    username: "john",
    password: "John0908",
    isAdmin: true,
  },
  {
    id: "2",
    username: "jane",
    password: "Jane0908",
    isAdmin: false,
  },
];

const generateToken = (user) => {
  jwt.sign(
    {
      id: user.id,
      isAdmin: user.isAdmin,
    },
    process.env.JSON_GEN_SEC,{expiresIn:"5min"}
  );
};

const generateRefreshToken = (user) => {
    jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JSON_REF_TOKEN
    );
  };


  let refreshTokens=[]

app.post("api/v1/login",(req,res)=>{
    const {username,password}=req.body;
    const user=users.find(user=>{
        return user.username==username && user.password==password
    })
    if(user){
        const accessToken=generateToken(user)
        const refreshToken=generateRefreshToken(user)
        refreshTokens.push(refreshToken)

        res.status(200).json({
            username:user.username,
            isAdmin:user.isAdmin,
            accessToken,
            refreshToken
        })
    }else{
        res.status(400).json("Username or password incorrect")
    }
})

const verifyToken=(req,res,next)=>{
    const headers=req.headers.token;
    if(headers){
        const token=headers.split(" ")[1]
        jwt.verify(token,process.env.JSON_GEN_SEC,(err,decode)=>{
            if(err){
                return res.status(403).json("Token is invalid")
            }
            req.user=decode
            next()
        })
    }else{
        return res.status(401).json("You are not authorized to access this")
    }
}


app.delete("api/v1/users/:userId",verifyToken,(req,res)=>{
    if(req.user.id==req.params.userId){
        return res.status(200).json("User has been deleted successfully")
    }else{
        return res.status(403).json("You are not authorized to access this")
    }
})

app.post("api/v1/logout",verifyToken,(req,res)=>{
    const refreshToken=req.body.refreshToken;
    if(!refreshToken){
        return res.status(403).json("You are not authenticated")
    }
    refreshTokens=refreshTokens.filter((token)=>{
        return token !==refreshToken
    })
    res.status(200).send("You are logout successfully!");
})

app.post("api/v1/refresh",(req,res)=>{
    const refreshToken=req.body.token;

    if(!refreshToken){
        return res.status(401).json("You are not authenticated");
    }
    if(!refreshToken.includes(refreshToken)){
        return res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken,process.env.JSON_REF_TOKEN,(err,decode)=>{
        if(err){
            return res.status(400).json(err)
        }
        refreshTokens=refreshTokens.filter(token=>token !==refreshToken)


        const newAccessToken=generateToken(decode)
        const newRefreshToken=generateRefreshToken(decode)

        refreshTokens.push(newRefreshToken)

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })
    })
})














const port = process.env.PORT || 8081;
app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}`);
});
