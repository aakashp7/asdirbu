'user strict';
const DB = require('../config/db');

class Users
{
	constructor(app)
	{
		this.db = DB;
	}
	async registerIndividual(name,service,dob,userType,email,password,lastname){
		try {	
			return await this.db.query(`INSERT INTO users(name,service,dob,userType,email,password,last_name) VALUES(?,?,?,?,?,?,?)`, [name,service,dob,userType,email,password,lastname]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async registerBusiness(companyName,companyCode,sector,userType,email,password){
		try {	
			return await this.db.query(`INSERT INTO users(companyName,companyCode,sector,userType,email,password) VALUES(?,?,?,?,?,?)`, [companyName,companyCode,sector,userType,email,password]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async isEmailUniue(email,userId){
		try {	
			if(userId!="0"){
				return await this.db.query(`SELECT * FROM users WHERE email = ? AND id != ?`, [email,userId]);
			}
			else {
				return await this.db.query(`SELECT * FROM users WHERE email = ?`, [email]);
			}
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async login(email,password){
		try 
		{	
			return await this.db.query(`SELECT * FROM users WHERE email = ? AND password = ?`, [email,password]);
		} 		
		catch (error) 
		{
			console.log(error);
			return false;
		}	
	}
	async getUserById(id){
		try{
			return await this.db.query(`SELECT * FROM users WHERE id = ?`, [id]);
		}
		catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getUserByEmail(email){
		try{
			return await this.db.query(`SELECT * FROM users WHERE email  = ?`, [email]);
		}
		catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getjobsByUserId(user_id){
		try{
			return await this.db.query(`SELECT * FROM greitas_skelbimas WHERE user_id = ? order by id desc limit 1`, [user_id]);
		}
		catch(exx){
			console.log(exx);
			return false;
		}
	}
	async update(id,name,lastName,email,phone,address,city,profileImage,bank_ac_no,lat,long,serviceName,specialty,otherServiceName,otherSpecialty,aboutMe,service,hourlyRate,imageList,type,taxPay,houseNumber){
		try{
			return await this.db.query(`UPDATE users SET name = ? , last_name = ?, email = ?, phone = ?, address = ?, city = ?, profile_image = ?, bank_ac_no = ?, latitude = ?,  longitude = ?,serviceName = ?,specialty = ?,otherServiceName = ?,otherSpecialty = ?,about_me = ?,service = ?,hourrate = ?,image = ? ,type = ? ,taxPay = ?,houseNumber = ? WHERE id = ?`, [name,lastName,email,phone,address,city,profileImage,bank_ac_no,lat,long,serviceName,specialty,otherServiceName,otherSpecialty,aboutMe,service,hourlyRate,imageList,type,taxPay,houseNumber,id]);
		}
		catch(exx){
			console.log(exx);
			return false;
		}
	}
	async InsertUserDocument(userId,doc,originalName){
		try{
			return await this.db.query(`INSERT INTO user_documents(user_id,document,name) VALUES(?,?,?)`, [userId,doc,originalName]);
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async deleteUserDocument(Id){
		try{
			return await this.db.query(`DELETE FROM user_documents where id = ?`, [Id]);
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async getUserDocument(userId){
		try{
			return await this.db.query(`SELECT * FROM user_documents Where user_id = ?`, [userId]);
		}catch(err){
			console.log(err);
			return false;
		}
	}

	async insertUserTimesheet(user_id,date,start,end){
		try{
			return await this.db.query('INSERT INTO user_timesheet(user_id,date,start,end) values(?,?,?,?)',[user_id,date,start,end]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async updateUserTimesheet(id,start,end){
		try{
			return await this.db.query('UPDATE user_timesheet SET start = ?, end = ? where id = ?',[start,end,id]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getUserTimesheet(user_id,startDate,endDate){
		try{
			let query = "SELECT * FROM user_timesheet WHERE user_id = "+user_id+" AND date >= '"+startDate+"' AND date <= '"+endDate+"'";
			return await this.db.query(query,[]);

		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getUserFullTimesheet(user_id,startDate,endDate){
		try{
			return await this.db.query('SELECT * FROM user_timesheet WHERE user_id = ?',[user_id]);

		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async UserTimesheetCheck(user_id,date){
		try{
			return await this.db.query('SELECT * FROM user_timesheet WHERE user_id = ? AND date = ?',[user_id,date]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getUserTimesheetByUserIdDate(user_id,date){
		try{
			return await this.db.query('SELECT * FROM user_timesheet WHERE user_id = ? AND date = ?',[user_id,date]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getUserAvgRatings(user_id){
		try{
			return await this.db.query('SELECT AVG(ratings) as rating FROM user_ratings WHERE user_id = ?',[user_id]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getUserReview(user_id){
		try{
			return await this.db.query('SELECT urat.*,u.name,u.email FROM user_ratings as urat LEFT JOIN users u ON u.id = urat.given_by_user_id WHERE urat.user_id = ? ORDER BY urat.id DESC',[user_id]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getUserReviewPaginate(user_id,limit,offset){
		try{
			return await this.db.query('SELECT urat.*,u.name,u.profile_image,u.email FROM user_ratings as urat LEFT JOIN users u ON u.id = urat.given_by_user_id WHERE urat.user_id = ? ORDER BY urat.id DESC limit ? offset ?',[user_id,limit,offset]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async storeUserReview(user_id,givenById,rating,review){
		try{
			return await this.db.query('INSERT INTO user_ratings(user_id,given_by_user_id,ratings,review) values(?,?,?,?)',[user_id,givenById,rating,review]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async saveAboutMe(user_id,aboutme,service,price,imageList,type,taxPay){
		try{
			return await this.db.query('UPDATE users set about_me = ?,service = ?, hourrate = ?,image = ?,type = ?,taxPay = ? where id = ?',[aboutme,service,price,imageList,type,taxPay,user_id]);
		}
		catch(exx){
			console.log(exx);
			return false;
		}
	}
	async subscribe(email){
		try{
			return await this.db.query('Insert INTO subscribers (email) values(?)',[email]);
		}
		catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getToken(token){
		try{
			return await this.db.query('SELECT * FROM user_activation WHERE token = ?',[token]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async storeToken(user_id,token){
		try{
			return await this.db.query('Insert INTO user_activation (user_id,token) values(?,?)',[user_id,token]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async deleteToken(id){
		try{
			return await this.db.query('DELETE FROM user_activation WHERE id = ?',[id]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async activateUser(user_id){
		try{
			return await this.db.query('UPDATE users SET is_user_verified = 1 WHERE id = ?',[user_id]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async getResetToken(token){
		try{
			return await this.db.query('SELECT * FROM reset_password WHERE token = ?',[token]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async storeResetToken(user_id,token){
		try{
			return await this.db.query('Insert INTO reset_password (user_id,token) values(?,?)',[user_id,token]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async deleteResetToken(id){
		try{
			return await this.db.query('DELETE FROM reset_password WHERE id = ?',[id]);
		}catch(exx){
			console.log(exx);
			return false;
		}
	}
	async changePassword(user_id,password){
		try{
			return await this.db.query('UPDATE users SET password = ? WHERE id = ?',[password,user_id]);
		}catch(error){
			console.log(error);
			return false;
		}
	}
	async getBookingByDate(date){
		try{
			return await this.db.query('SELECT company.email AS companyEmail,developer.email AS developerEmail FROM bookings LEFT JOIN users AS company ON company.id = bookings.user_id LEFT JOIN users AS developer ON developer.id = bookings.booked_user_id WHERE DATE_FORMAT(createdAt,"%Y-%m-%d") = ?',[date]);
		}catch(error){
			console.log(error);
			return false;
		}
	}
	async getAllBookingJobWise(previousDate){
		try {
			return await this.db.query('SELECT bookings.booked_user_id as userId,bookings.id As bookingId,users.email as email FROM bookings  INNER JOIN greitas_skelbimas ON greitas_skelbimas.id  = bookings.jobId AND paslaugos_priėmimo_vieta = ? LEFT JOIN users ON users.id = bookings.user_id WHERE jobId!=0',[previousDate]);
		}
		catch(error)
		{
			console.log(error);
			return false;
		}
	}
	async getBookingByDayWise(){
		try{
			return await this.db.query('SELECT users.email AS email,bookings.booked_user_id AS userId,bookings.id AS bookingId,hire_day.dates AS hireList FROM bookings INNER JOIN hire_day ON hire_day.id = bookings.hire_id LEFT JOIN users ON users.id = bookings.user_id  WHERE hire_id !=0');
		}
		catch(error)
		{
			console.log(error);
			return false;
		}
	}

	async updateReviewStatus(bookingId){
		try {
			return await this.db.query("UPDATE bookings SET hasReview = 1 WHERE id = ? ",[bookingId]);
		}
		catch(error)
		{
			console.log(error);
			return false;
		}
	}

	async addUserChat(fromUserId,toUserId,postJobId){
		try {
			return await this.db.query("INSERT INTO nearest_user(postjob_id,from_user_id,to_user_id) VALUES(?,?,?)",[postJobId,fromUserId,toUserId]);
		}
		catch(error) {
			console.log(error);
			return false;
		}
	}
	async checkUserChat(fromUserId,toUserId,postJobId){
		try {
			return await this.db.query("SELECT * FROM nearest_user WHERE postjob_id = ? AND from_user_id = ? AND  to_user_id = ?",[postJobId,fromUserId,toUserId]);
		}
		catch(error){
			console.log(error);
			return false;
		}
	}
	async checkSocialLogin(appId){
		try {	
			return await this.db.query(`SELECT * FROM users WHERE appId = ?`, [appId]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async socialLogin(name,appId,userType,email,loginType){
		try {	
			return await this.db.query(`INSERT INTO users(name,appId,userType,email,loginType,is_user_verified) VALUES(?,?,?,?,?,?)`, [name,appId,userType,email,loginType,1]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	
	async deleteDocumentByUserId(userId){
		try {	
			return await this.db.query(`DELETE FROM user_documents WHERE user_id`,[userId]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async updateDocumentUserIdById(userId,documentId){
		try {	
			
			return await this.db.query(`UPDATE user_documents SET user_id = ? WHERE id IN(?)`,[userId,documentId]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	
}
module.exports = new Users();