'user strict';
const DB = require('../config/db');

class Home
{
	constructor(app)
	{
		this.db = DB;
	}
	/* START First time load at that time call this method */
	async countNewUser(Id){
		try {
			return await this.db.query(`SELECT COUNT(id) AS userCount FROM users where hourrate >= 0 AND id != ? AND isApproved = 1`,[Id]);
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async countAllJob(curruntUserId){
		try {
			return await this.db.query(`SELECT COUNT(id) AS jobCount FROM greitas_skelbimas WHERE skelbimo_pavadinimas !="" AND skelbimo_pavadinimas !="undefined" AND user_id != ?`,[curruntUserId]);
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async getAlljob(limit,offset,curruntUserId){
		try {
			console.log("curruntUserId",curruntUserId);
			return await this.db.query(`SELECT job.id AS id,job.pridėk_nuotrauką AS documentImage,job.skelbimo_pavadinimas AS name,IF(job.serviceName IS NULL,'',job.serviceName) AS serviceName,IF(job.otherServiceName IS NULL,'',job.otherServiceName) AS otherServiceName,job.paslaugos_kaina AS hourrate,job.latitude AS latitude,job.longitude AS longitude,users.profile_image AS profile_image,IF(users.taxPay IS NULL,0,users.taxPay) AS taxPay FROM greitas_skelbimas AS job LEFT JOIN users ON users.id = job.user_id WHERE job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined" AND job.user_id != ? ORDER BY job.id DESC limit ? offset ?`,[curruntUserId,limit,offset]); 
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async getNewUsers(limit,offset,curruntUserId){
		try {
			return await this.db.query(`SELECT u.*,AVG(ur.ratings) AS user_rating from users u left join user_ratings ur ON ur.user_id = u.id where u.hourrate > 0 AND u.id != ? AND isApproved = 1 GROUP by u.id ORDER BY u.id desc limit ? offset ?`,[curruntUserId,limit,offset]);
		}catch(err){
			console.log(err);
			return false;
		}
	}
	
async getAllLocation(curruntUserId){
	try {
		return await this.db.query(`SELECT u.*,AVG(ur.ratings) AS user_rating from users u left join user_ratings ur ON ur.user_id = u.id where u.hourrate > 0 AND u.id != ? AND isApproved = 1 GROUP by u.id ORDER BY u.id desc`,[curruntUserId]);
	}catch(err){
		console.log(err);
		return false;
	}
}
	/* END */

	/* Search User */
	async getSearchUsersCount(city,serviceName,otherServiceName,specialty,otherSpecialty,curruntUserId){
		try {
			return await this.db.query(`SELECT count(id) AS userCount FROM users WHERE (IF(? = 'Kita',(otherServiceName=?),(serviceName=?)) OR IF(? = 'Kitas',(otherSpecialty=?),(specialty=?)) OR city LIKE ?) AND id != ? AND isApproved = 1 AND hourrate > 0`,[serviceName,otherServiceName,serviceName,specialty,otherSpecialty,specialty,city,curruntUserId]);
		}
		catch(error) {
			console.log("db error message ",error);
			return false;
		}
	}
	async getSearchJobCount(city,serviceName,otherServiceName,specialty,otherSpecialty,curruntUserId){
		try {
			return await this.db.query(`SELECT COUNT(job.id) AS jobCount FROM greitas_skelbimas AS job LEFT JOIN users ON users.id = job.user_id  WHERE job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined" AND job.user_id != ? AND (IF(? = 'Kita',(job.otherServiceName=?),(job.serviceName=?)) OR IF(? = 'Kitas',(job.otherSpecialty=?),(job.specialty=?)) OR paslaugos_suteikimo_vieta LIKE ?)`,[curruntUserId,serviceName,otherServiceName,serviceName,specialty,otherSpecialty,specialty,city]);
		}
		catch(error) {
			console.log("db error message ",error);
			return false;
		}
	}

	async getSearchNewUsers(city,serviceName,otherServiceName,specialty,otherSpecialty,limit,offset,curruntUserId){
		try {
			return await this.db.query(`SELECT u.*,(SELECT AVG(user_ratings.ratings) FROM user_ratings WHERE user_ratings.user_id = u.id) AS user_rating FROM users  AS u WHERE (IF(? = 'Kita',(otherServiceName=?),(serviceName=?)) OR IF(? = 'Kitas',(otherSpecialty=?),(specialty=?)) OR city LIKE ?) AND u.id != ? AND isApproved = 1 AND u.hourrate > 0 ORDER BY u.id  DESC LIMIT ? OFFSET ?`,[serviceName,otherServiceName,serviceName,specialty,otherSpecialty,specialty,city,curruntUserId,limit,offset]);
		}catch(error){
			console.log("db error message ",error);
			return false;
		}
	}
	async getSearchjob(city,serviceName,otherServiceName,specialty,otherSpecialty,limit,offset,curruntUserId){
		try{
			return await this.db.query(`SELECT job.id AS id,job.pridėk_nuotrauką AS documentImage,job.skelbimo_pavadinimas AS name,IF(job.serviceName IS NULL,'',job.serviceName) AS serviceName,IF(job.otherServiceName IS NULL,'',job.otherServiceName) AS otherServiceName,job.paslaugos_kaina AS hourrate,job.latitude AS latitude,job.longitude AS longitude,users.profile_image AS profile_image,IF(users.taxPay IS NULL,0,users.taxPay) AS taxPay FROM greitas_skelbimas AS job LEFT JOIN users ON users.id = job.user_id WHERE job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined" AND job.user_id != ? AND (IF(? = 'Kita',(job.otherServiceName=?),(job.serviceName=?)) OR IF(? = 'Kitas',(job.otherSpecialty=?),(job.specialty=?)) OR paslaugos_suteikimo_vieta LIKE ?) ORDER BY job.id DESC limit ? offset ?`,[curruntUserId,serviceName,otherServiceName,serviceName,specialty,otherSpecialty,specialty,city,limit,offset]);
		}catch(error){
			console.log("db error message ",error);
			return false;
		}
	}
	/* END user */






	async getFilterUsersCount(price,distance,curruntUserId,latitude,longitude){
		try {
			let query = "";
			if(price > 0 && distance > 0 && latitude != 0 && longitude != 0){
			 	query = `SELECT COUNT( u.id ) as userCount FROM users AS  u WHERE u.id != ${curruntUserId} AND u.hourrate >=${price} AND isApproved = 1 AND (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(u.Latitude)) * COS(RADIANS(${longitude} - u.Longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(u.Latitude)))))) < ${distance}`;
			}
			
			else if(distance > 0 && latitude != 0 && longitude != 0){
				query = `SELECT COUNT( u.id ) as userCount FROM users AS  u WHERE u.id != ${curruntUserId} AND isApproved = 1 AND (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(u.Latitude)) * COS(RADIANS(${longitude} - u.Longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(u.Latitude)))))) < ${distance}`;
			}
			else{
				query = `SELECT COUNT( u.id ) as userCount FROM users AS  u WHERE u.id != ${curruntUserId} AND isApproved = 1 AND u.hourrate >=${price}`;
			}
			return await this.db.query(query);
		}catch(err){
			return false;
		}
	}

	async getFilterJobCount(price,distance,curruntUserId,latitude,longitude){
		try {
			let query = "";
			if(price > 0 && distance > 0 && latitude != 0 && longitude != 0){
			 	query = `SELECT COUNT( job.id ) as jobCount FROM greitas_skelbimas AS  job INNER JOIN users ON users.id = job.user_id AND users.id != ${curruntUserId} WHERE job.paslaugos_kaina >= ${price} AND (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(job.latitude)) * COS(RADIANS(${longitude} - job.longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(job.latitude)))))) < ${distance} AND job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined"`;
			}			
			else if(distance > 0 && latitude != 0 && longitude != 0){
				query = `SELECT COUNT( job.id ) as jobCount FROM greitas_skelbimas AS  job INNER JOIN users ON users.id = job.user_id AND users.id != ${curruntUserId} WHERE  (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(job.latitude)) * COS(RADIANS(${longitude} - job.longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(job.latitude)))))) < ${distance}  AND job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined"`;
			}
			else{
				query = `SELECT COUNT( job.id ) as jobCount FROM greitas_skelbimas AS  job INNER JOIN users ON users.id = job.user_id AND users.id != ${curruntUserId} WHERE job.paslaugos_kaina >= ${price}  AND job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined"`;
			}
			return await this.db.query(query);
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async getFilterNewUsers(price,distance,limit,offset,curruntUserId,latitude,longitude){
		try{
			let query = "";
			if(price > 0 && distance > 0 && latitude != 0 && longitude != 0){
			    query = `SELECT *,(SELECT AVG(user_ratings.ratings) FROM user_ratings WHERE user_ratings.user_id = u.id) AS user_rating, (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(u.Latitude)) * COS(RADIANS(${longitude} - u.Longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(u.Latitude)))))) AS distance_km FROM users AS  u 
				WHERE u.id != ${curruntUserId} AND isApproved = 1 AND u.hourrate >=${price} AND (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(u.Latitude)) * COS(RADIANS(${longitude} - u.Longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(u.Latitude)))))) < ${distance}
				ORDER BY u.hourrate desc,distance_km desc,u.id desc limit ${limit} offset ${offset}`;
			}
			else if(distance > 0 && latitude != 0 && longitude != 0){
			    query = `SELECT *,(SELECT AVG(user_ratings.ratings) FROM user_ratings WHERE user_ratings.user_id = u.id) AS user_rating, (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(u.Latitude)) * COS(RADIANS(${longitude} - u.Longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(u.Latitude)))))) AS distance_km FROM users AS  u 
				WHERE u.id != ${curruntUserId} AND isApproved = 1 AND (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(u.Latitude)) * COS(RADIANS(${longitude} - u.Longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(u.Latitude)))))) < ${distance}
				ORDER BY distance_km desc,u.id desc limit ${limit} offset ${offset}`;
			}
			else {
			   query = `SELECT *,(SELECT AVG(user_ratings.ratings) FROM user_ratings WHERE user_ratings.user_id = u.id) AS user_rating FROM users AS  u 
				WHERE u.id != ${curruntUserId} AND isApproved = 1 AND u.hourrate >=${price} 
				ORDER BY u.hourrate desc,u.id desc limit ${limit} offset ${offset}`;
			}
			return await this.db.query(query);
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async getFilterJob(price,distance,limit,offset,curruntUserId,latitude,longitude){
		try{
			let query = "";
			if(price > 0 && distance > 0 && latitude != 0 && longitude != 0){
			    query = `SELECT job.id AS id,job.pridėk_nuotrauką AS documentImage,job.skelbimo_pavadinimas AS name,IF(job.serviceName IS NULL,'',job.serviceName) AS serviceName,IF(job.otherServiceName IS NULL,'',job.otherServiceName) AS otherServiceName,job.paslaugos_kaina AS hourrate,job.latitude AS latitude,job.longitude AS longitude,users.profile_image AS profile_image,IF(users.taxPay IS NULL,0,users.taxPay) AS taxPay FROM greitas_skelbimas AS  job INNER JOIN users ON users.id = job.user_id AND users.id != ${curruntUserId} WHERE job.paslaugos_kaina >= ${price} AND (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(job.latitude)) * COS(RADIANS(${longitude} - job.longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(job.latitude)))))) < ${distance} AND job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined" ORDER BY job.id DESC limit ${limit} offset ${offset}`;
			}
			else if(distance > 0 && latitude != 0 && longitude != 0){
			    query = `SELECT job.id AS id,job.pridėk_nuotrauką AS documentImage,job.skelbimo_pavadinimas AS name,IF(job.serviceName IS NULL,'',job.serviceName) AS serviceName,IF(job.otherServiceName IS NULL,'',job.otherServiceName) AS otherServiceName,job.paslaugos_kaina AS hourrate,job.latitude AS latitude,job.longitude AS longitude,users.profile_image AS profile_image,IF(users.taxPay IS NULL,0,users.taxPay) AS taxPay FROM greitas_skelbimas AS  job INNER JOIN users ON users.id = job.user_id AND users.id != ${curruntUserId} WHERE (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(job.latitude)) * COS(RADIANS(${longitude} - job.longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(job.latitude)))))) < ${distance} AND job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined" ORDER BY job.id DESC limit ${limit} offset ${offset}`;
			}
			else {
			    query = `SELECT job.id AS id,job.pridėk_nuotrauką AS documentImage,job.skelbimo_pavadinimas AS name,IF(job.serviceName IS NULL,'',job.serviceName) AS serviceName,IF(job.otherServiceName IS NULL,'',job.otherServiceName) AS otherServiceName,job.paslaugos_kaina AS hourrate,job.latitude AS latitude,job.longitude AS longitude,users.profile_image AS profile_image,IF(users.taxPay IS NULL,0,users.taxPay) AS taxPay FROM greitas_skelbimas AS job INNER JOIN users ON users.id = job.user_id AND users.id != ${curruntUserId} WHERE job.paslaugos_kaina >= ${price}  AND job.skelbimo_pavadinimas !="" AND job.skelbimo_pavadinimas != "undefined"  ORDER BY job.id DESC limit ${limit} offset ${offset}`;
			}
			return await this.db.query(query);
		}catch(err){
			console.log(err);
			return false;
		}
	}

	async getJobsBylatlong(latitude,longitude,distance){
		try{
			return await this.db.query(`SELECT id from greitas_skelbimas as b WHERE   (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(?)) * COS(RADIANS(b.Latitude)) * COS(RADIANS(? - b.Longitude)) + SIN(RADIANS(?)) * SIN(RADIANS(b.Latitude)))))) < 16`,[latitude,longitude,latitude]);
		}
		catch(err){
			console.log(err);
			return false;
		}
	}
}
module.exports = new Home();