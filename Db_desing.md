### Appointments

Guests: string[],
reason: string,
status: "pending" | "done"
slotId: ObjectId
userId: ObjectId
isDeleted: booloen (default false)

### Slots

startTime: 12:00
endTime: 12:30
date: Date
isBooked: boolean
userId: ObjectId

### User

name : string
userId: string
email:string
availiblitySettings: ObjectId
sharableId: uuid

### Availibilty Settings

Workdays:[0,1,2,3,4,5,6] (1,2,3,4,5) default
startTime:
endTime:

# PRD :

1. When user signs in first time, create `User` and `Slots` for that week from today ot 5th day

## Crons :

1. We will create slots on every sunday for next week (we can extend it for every 2 weeks)
2. Delete Slots that was not booked in the past every day or weekend

### API Routes

## GET /appoinments

1. Get All appintments
2. By default get appointments for current week
3. Accepts params from there we can go to next or previous weeks
4. Populate slots with the API response

## GET /appointments/available

1. We will get all the slot for current week
2. Accepts params from there we can go to next or previous weeks

## POST /appoinments

1. Client will send the slot id for the appinment.
2. We will find the slot and check if it is not booked already
3. If it is not booked Create `Appoinment` and Update slot status `isBooked` as true
4. return the `Appoinment` with slot populated

## DELETE /appoinments/:id

1. We will send the appointId from the params.
2. Get the slot details and check if the slot is in the future then go ahed.
3. Find the Appointment and mark `isDeleted` as true and update `Slot` as `isBooked` as false
