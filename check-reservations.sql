SELECT 
  id,
  nome,
  cognome,
  email,
  telefono,
  data,
  ora,
  persone,
  stato,
  createdAt as "Data Creazione"
FROM "Reservation"
ORDER BY createdAt DESC;