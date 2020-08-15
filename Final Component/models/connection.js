//creating a workshop model
var Workshop = function (workshopId, workshopName, workshopType, place, details, date, image, createdby) {
    this.workshopId = workshopId;
    this.workshopName = workshopName;
    this.workshopType = workshopType;
    this.place = place;
    this.details = details;
    this.date = date;
    this.image = image;
    this.createdby = createdby;



   
};


module.exports = {
    Workshop: Workshop
}
