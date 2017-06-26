use taskenize;
db.tasks.updateMany({"automation.timingDurationUnit": {$exists: true, $nin: [null,0,1,2]}}, {$set:{"automation.timingDurationUnit": null}})
db.tasks.updateMany({"automation.timingDurationUnit": {$exists: true, $in: [0,1,2]}}, {$inc:{"automation.timingDurationUnit": 2}})
