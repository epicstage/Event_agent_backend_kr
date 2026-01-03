# Cvent RFP Objects - JSON Schema

## 소스
- https://developers.cvent.com/docs/legacy-api/csn/supplier-guide/rfp-objects
- https://developers.cvent.com/docs/legacy-api/csn/planner-guide/rfp-objects

## RFP Contact Object
```json
{
  "contact": {
    "firstName": "Julian",
    "lastName": "S",
    "organization": "CSN",
    "organizationWebsite": "",
    "title": "developer",
    "email": "example@mail.com",
    "phone": "123456",
    "fax": "70311111111_rfp",
    "mobile": "70355555555_rfp",
    "address1": "8180 Greensboro Drive",
    "address2": "suite 450_rfp",
    "address3": "",
    "city": "Mclean_rfp",
    "stateProvince": "VA",
    "country": "IN",
    "postalCode": "22012",
    "additionalInfo": "df",
    "isThirdPartyPlanner": false,
    "preferredContactMethods": ["FAX"]
  }
}
```

## RFP Event Object
```json
{
  "event": {
    "name": "New event",
    "startDate": "2015-08-20",
    "endDate": "2015-08-20",
    "isDatesFlexible": false,
    "type": "BLANK",
    "attendeesPerDay": 1000,
    "attendeeNote": "",
    "totalBudget": 0,
    "budgetedRoomRate": 0,
    "foodBeverageBudget": 10000,
    "contractSignatureLocation": "",
    "businessObjectives": "",
    "destinationsUnderConsideration": ""
  }
}
```

## RFP Date Requirements Object
```json
{
  "dateType": "PREFERRED",
  "peakRoomNights": 4,
  "totalRoomNights": 4,
  "checkInDate": "2010-08-31",
  "additionalInfo": "1",
  "budgetedRoomRate": 1,
  "roomBlocks": [
    {
      "date": "2010-08-31",
      "totalRooms": 4,
      "note": "",
      "roomDetails": [
        {
          "type": "ANY",
          "quantity": 1,
          "occupancy": "BLANK"
        },
        {
          "type": "SINGLE",
          "quantity": 1,
          "occupancy": "BLANK"
        }
      ]
    }
  ]
}
```

## RFP Preferred Dates Array
```json
[
  {
    "id": "00000000-0000-0000-0000-000000000000",
    "startDate": "2019-11-24",
    "endDate": "2019-11-28",
    "isPreferred": true
  },
  {
    "id": "00000000-0000-0000-0000-000000000000",
    "startDate": "2019-11-27",
    "endDate": "2019-12-01",
    "isPreferred": true
  }
]
```

## Event History Object
```json
[
  {
    "id": "04107216-a469-485b-8174-1c0690447dc2",
    "venueName": "Marriot courtyard",
    "city": "chen",
    "stateProvince": "TN",
    "dateRange": "09/09/2009-10/09/2009",
    "attendees": 23,
    "sleepingRoomPickup": 34,
    "sleepingRoomBlock": 33,
    "foodBeverageSpend": "3434",
    "notes": ""
  }
]
```

## Organization Profile
```json
{
  "eventsPerYear": 32,
  "singleDayEventPercent": "BLANK",
  "multipleDayEventPercent": "BLANK",
  "averageRoomNightsPerEvent": "BLANK",
  "totalAttendeesPerYear": "BLANK",
  "totalRoomNightsPerYear": "BLANK"
}
```

## Key Fields Summary

| 카테고리 | 주요 필드 |
|---------|----------|
| Contact | firstName, lastName, organization, email, phone, address |
| Event | name, startDate, endDate, type, attendeesPerDay, totalBudget |
| Budget | totalBudget, budgetedRoomRate, foodBeverageBudget |
| Room Block | date, totalRooms, roomDetails (type, quantity, occupancy) |
| History | venueName, attendees, sleepingRoomPickup, foodBeverageSpend |
