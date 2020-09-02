'user strict';
const DB = require('../config/db');

class Booking
{
	constructor(app)
	{
		this.db = DB;
	}
	async getBookingById(Id){
		try {	
			return await this.db.query(`SELECT * FROM bookings WHERE id = ?`, [Id]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async getAllHireList(){
		try {	
			return await this.db.query('SELECT DISTINCT hire_day.*,IF(bookings.id IS NULL,false,true) as isHired FROM hire_day LEFT JOIN bookings ON bookings.hire_id = hire_day.id');
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async storeBooking(userId,bookedUserId,tnxId,hireId,flag,totalAmount,fees,userHireType,jobId){
		try {	
			return await this.db.query(`INSERT INTO bookings(user_id,booked_user_id,tnx_id,hire_id,flag,totalAmount,fees,userHireType,jobId) VALUES(?,?,?,?,?,?,?,?,?)`, [userId,bookedUserId,tnxId,hireId,flag,totalAmount,fees,userHireType,jobId]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async storeBookingMessage(bookId,message){
		try {	
			return await this.db.query(`UPDATE bookings SET req_message = ? WHERE id = ?`, [message,bookId]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async getBookingDetailById(bookingId){
		try {	
			return await this.db.query(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}

	async storeMessage(fromUserId,toUserId,message){
		try {	
			return await this.db.query(`INSERT INTO user_chat(sender_id,reciver_id,message) VALUES(?,?,?)`, [fromUserId,toUserId,message]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async storeUserHireDay(dates){
		try {	
			return await this.db.query(`INSERT INTO hire_day(dates) VALUES(?)`, [dates]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async getUserHireDayByid(id){
		try {	
			return await this.db.query(`SELECT * FROM hire_day WHERE id = ?`, [id]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async checkUserHire(hireIdList){
		try {	
			return await this.db.query(`SELECT hire_id FROM bookings WHERE hire_id IN(?)`, [hireIdList]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async getUserDetailsById(id){
		try {	
			return await this.db.query(`SELECT id,name FROM users WHERE id = ?`,[id]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
	async getTimeSheetByUserId(userid){
		try {	
			return await this.db.query(`SELECT * FROM user_timesheet WHERE user_id = ?`,[userid]);
		} 		
		catch (error) {
			console.log(error);
			return false;
		}	
	}
}


module.exports = new Booking();