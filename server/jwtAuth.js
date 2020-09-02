var config = require('./config/config');
var jwt = require('jsonwebtoken');
const Users = require('./model/users');
var jwtAuth = {};


jwtAuth.verifyToken = async function (req, res, next) {
    var token = req.headers["x-access-token"];
    if (!token || token == null) {
        return res
            .status(401)
            .send({ status: false, auth: false, message: "Ženklas nepateiktas." });
    }
    try{
        var tokenData = await jwt.verify(token, config.secret);
        Users.getUserById(tokenData.id).then(result=>{
            var string          = JSON.stringify(result);
            var UserArray       = JSON.parse(string);
            req.id              = UserArray[0].id; 
            req.profile_image   = UserArray[0].profile_image ? UserArray[0].profile_image : ''; 
            req.email           = UserArray[0].email; 
            req.companyName     = UserArray[0].companyName; 
            req.companyCode     = UserArray[0].companyCode; 
            req.userType        = UserArray[0].userType; 
            req.latitude        = UserArray[0].latitude;
            req.longitude       = UserArray[0].longitude;
            next();
        });
    }
    catch(err){
        return res.status(401).send({
          status: false,
          auth: false,
          token: null,
          message: "Nepavyko autentifikuoti prieigos rakto."
        });
    }
}
jwtAuth.createToken = async function(id){
    console.log(Math.floor(Date.now() / 100) + (60 * 60));
	return jwt.sign({
                id : id,
                iss: config.issuer,
                aud: config.audience,
//                exp: Math.floor(Date.now() / 1000) + (120 * 120),
                alg: ''
              }, config.secret);    
}
module.exports = jwtAuth;