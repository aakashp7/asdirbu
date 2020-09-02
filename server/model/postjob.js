'user strict';
const DB = require('../config/db');

class Postjob
{
	constructor(app)
	{
		this.db = DB;
	}

	async createjob(user_id,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,pridėk_nuotrauką,paslaugos_priėmimo_vieta,job_type,paslaugos_priemimo_laikas,latitude,longitude,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery){
		try{	
			return await this.db.query(`INSERT INTO greitas_skelbimas(user_id,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,pridėk_nuotrauką,paslaugos_priėmimo_vieta,job_type,paslaugos_priemimo_laikas,latitude,longitude,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [user_id,skelbimo_pavadinimas,papasakok_plačiau,Raktažodžiai,paslaugos_kaina,paslaugos_suteikimo_vieta,distance,pridėk_nuotrauką,paslaugos_priėmimo_vieta,job_type,paslaugos_priemimo_laikas,latitude,longitude,serviceName,specialty,otherServiceName,otherSpecialty,placeGoodsDelivery]);
		} 		
		catch (error) 
		{
			console.log(error);
			return false;
		}	
	}

	async getUserListBylatlong(distance,currentLatitude,currentLongitude,job_type,serviceName,specialty,otherServiceName,otherSpecialty) {
		try {
			if(job_type==2){
				return await this.db.query(`SELECT id,email from users as b WHERE   (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(?)) * COS(RADIANS(b.Latitude)) * COS(RADIANS(? - b.Longitude)) + SIN(RADIANS(?)) * SIN(RADIANS(b.Latitude)))))) < ?`,[currentLatitude,currentLongitude,currentLatitude,distance]);
			}
			else {
				return await this.db.query(`SELECT id,email from users as b WHERE   (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(?)) * COS(RADIANS(b.Latitude)) * COS(RADIANS(? - b.Longitude)) + SIN(RADIANS(?)) * SIN(RADIANS(b.Latitude)))))) < ? AND  IF(? = 'Kita',(otherServiceName=?),(serviceName=?)) AND IF(? = 'Kitas',(otherSpecialty=?),(specialty=?))`,[currentLatitude,currentLongitude,currentLatitude,distance,serviceName,otherServiceName,serviceName,specialty,otherSpecialty,specialty]);
			}
		}
		catch(err) {
			return false;
		}
	}

	async getUserListByid(userid) {
		try {
			return await this.db.query(`SELECT * FROM users WHERE id = ?`,[userid]);
		}
		catch(err) {
		//	console.log(err);
			return false;
		}
	}

	async storeNearestUser(fromUserId,toUserId,postJobId) {
		try {
			console.log("Dmeo",fromUserId,toUserId,postJobId);
			return await this.db.query(`INSERT INTO nearest_user(postjob_id,from_user_id,to_user_id) VALUES(?,?,?)`,[postJobId,fromUserId,toUserId]);
		}
		catch(err) {
			console.log(err);
			return false;
		}
	}

	async getJobDetailsById(jobId){
		try {
			console.log("==========================");
			return await this.db.query(`SELECT greitas_skelbimas.*,users.name as name,users.email as email FROM greitas_skelbimas INNER JOIN users ON users.id = greitas_skelbimas.user_id  WHERE greitas_skelbimas.id = ? `,[jobId]);
		}
		catch(err) {
			return false;
		}	
	}
	
	async storeMessage(senderId,reciverId,message){
		try {
			return await this.db.query(`INSERT INTO user_chat(sender_id,reciver_id,message) VALUES(?,?,?)`,[senderId,reciverId,message]);
		}
		catch(err) {
			return false;
		}	
	}

	async getUserDetailsByJobId(jobId){
		try {
			return await this.db.query(`SELECT * FROM greitas_skelbimas WHERE id = ?`,[jobId]);
		}
		catch(err) {
			console.log("Error",err);
			return false;
		}	
	}

	async getUserDetailsById(userId){
		try {
			return await this.db.query(`SELECT * FROM users  WHERE id = ?`,[userId]);
		}
		catch(err) {
			console.log("Error",err);
			return false;
		}	
	}
	/*async getJobDetailsById(jobId){
		try {
			return await this.db.query(`SELECT * FROM greitas_skelbimas  WHERE id = ?`,[jobId]);
		}
		catch(err) {
			console.log("Error",err);
			return false;
		}	
	}*/
	async checkMessageStore(from_user_id,to_user_id,postjob_id){
		try {
			return await this.db.query(`SELECT * FROM nearest_user WHERE from_user_id = ? && to_user_id = ? && postjob_id = ?`,[from_user_id,to_user_id,postjob_id]);
		}
		catch(err) {
			console.log("Error",err);
			return false;
		}	
	}
}

module.exports = new Postjob();
