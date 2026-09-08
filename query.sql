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
  created_at as "Data Creazione"
FROM "Reservation"
ORDER BY created_at DESC;
