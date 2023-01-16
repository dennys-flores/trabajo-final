/*creacion de tabla*/
CREATE TABLE usuarios (
  id serial PRIMARY key,
  nombreCompleto varchar(2000) NOT NULL,
  edad integer NOT NULL
);

/*consulta para promedio de edad*/
select sum(u.edad)/count(u.edad) as promedioedad
from usuarios u 