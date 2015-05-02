

//parsing
compareCompoundUnit("5m/s",  5, ['meter',1,'second',-1]);
compareCompoundUnit("5m/s^2",5, ['meter',1,'second',-2]);
compareCompoundUnit("60 mi/h",60,['mile',1,'hour',-1]);

//arithmetic
compareCompoundUnit("10m/s - 3m/s",7,['meter',1,'second',-1]);
compareCompoundUnit('1m/s  - 3C/s',null); // this is an error. can't add those units
compareCompoundUnit("10m/s * 5s",50,['meter',1]);
compareCompoundUnit("5m/s * 2C",10,['meter',1,'second',-1,'celsius',1]);

//rate of 1 degree per year
compareCompoundUnit("0.5C/yr * 200yr",100,['celsius',1]);
comapreCompoundUnit("40C / 20 yr",2,['celsius',1,'year',-1]);


//time to fly around the earth
compareCompoundUnit(t,'earth_circ',7*1000,['mile',1]);
compareCompoundUnit(t,'airspeed',700,['miles',1,'hour',-1]);
compareCompoundUnit(t,'earth_circ/airspeed',10,['hour',1]);

