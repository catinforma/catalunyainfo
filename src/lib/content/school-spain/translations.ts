/**
 * The words of the community records (data.ts) and of the public holidays
 * (holidays.ts) in Catalan and English, keyed by the Spanish text as it was
 * transcribed. Only words: every date and number here repeats the Spanish
 * source, and a test checks that no text of a record is left without its pair.
 *
 * What is NOT here stays in Spanish in the three editions, as the official
 * text prints it: the title of each order, the body that signs it, the
 * bulletin's initials (BOJA, DOGV...) and the names of the municipalities.
 */
export const SCHOOL_TEXT: Record<string, readonly [ca: string, en: string]> = {
  // Public holidays (BOE work calendars)
  "Fiesta Nacional de España": ["Festa Nacional d'Espanya", "Spain's National Day"],
  "Día siguiente a Todos los Santos": ["Endemà de Tots Sants", "Day after All Saints' Day"],
  "Lunes siguiente al Día de la Constitución Española": ["Dilluns següent al Dia de la Constitució", "Monday after Constitution Day"],
  "Inmaculada Concepción": ["Immaculada Concepció", "Immaculate Conception"],
  "Natividad del Señor": ["Nadal", "Christmas Day"],
  "Año Nuevo": ["Cap d'Any", "New Year's Day"],
  "Epifanía del Señor": ["Reis (Epifania)", "Epiphany"],
  "Jueves Santo": ["Dijous Sant", "Maundy Thursday"],
  "Viernes Santo": ["Divendres Sant", "Good Friday"],
  "Fiesta del Trabajo": ["Festa del Treball", "Labour Day"],
  "Lunes de Pascua": ["Dilluns de Pasqua", "Easter Monday"],
  "San Esteban": ["Sant Esteve", "St Stephen's Day"],
  "San José": ["Sant Josep", "St Joseph's Day"],
  "Corpus Christi": ["Corpus Christi", "Corpus Christi"],
  "La Bien Aparecida": ["La Bien Aparecida", "La Bien Aparecida"],
  "Día de Andalucía": ["Dia d'Andalusia", "Andalusia Day"],
  "San Jorge/Día de Aragón": ["Sant Jordi/Dia de l'Aragó", "St George's Day/Aragon Day"],
  "Día de Asturias": ["Dia d'Astúries", "Asturias Day"],
  "Día de les Illes Balears": ["Dia de les Illes Balears", "Balearic Islands Day"],
  "Fiesta de Castilla y León": ["Festa de Castella i Lleó", "Castile and León Day"],
  "Día de Castilla-La Mancha": ["Dia de Castella-la Manxa", "Castile-La Mancha Day"],
  "Día de Ceuta": ["Dia de Ceuta", "Ceuta Day"],
  "Eidul Adha-Fiesta Sacrificio": ["Eidul Adha-Festa del Sacrifici", "Eid al-Adha (Feast of the Sacrifice)"],
  "Día de la Comunitat Valenciana": ["Dia de la Comunitat Valenciana", "Valencian Community Day"],
  "Día de Extremadura": ["Dia d'Extremadura", "Extremadura Day"],
  "Día de las Letras Gallegas": ["Dia de les Lletres Gallegues", "Galician Literature Day"],
  "Día de La Rioja": ["Dia de la Rioja", "La Rioja Day"],
  "Fiesta del Eid Fitr": ["Festa de l'Eid Fitr", "Eid al-Fitr"],
  "Fiesta Sacrificio-Aid Al Adha": ["Festa del Sacrifici-Aid Al Adha", "Feast of the Sacrifice (Eid al-Adha)"],
  "Día de la Región de Murcia": ["Dia de la Regió de Múrcia", "Region of Murcia Day"],
  "Fiesta Nacional de Cataluña": ["Diada Nacional de Catalunya", "National Day of Catalonia"],
  "Día de San Juan": ["Sant Joan", "St John's Day"],

  // Stages, as each order groups them
  "Infantil (2.º ciclo), Primaria y Educación Especial": ["Infantil (2n cicle), Primària i Educació Especial", "Infant (second cycle), Primary and Special Education"],
  "ESO, 1.º de Bachillerato y FP": ["ESO, 1r de Batxillerat i FP", "ESO, first year of Bachillerato and vocational training (FP)"],
  "2.º de Bachillerato": ["2n de Batxillerat", "Second year of Bachillerato"],
  "Escuelas Oficiales de Idiomas": ["Escoles Oficials d'Idiomes", "Official Language Schools"],
  "Infantil, Primaria, Educación Especial y ESO": ["Infantil, Primària, Educació Especial i ESO", "Infant, Primary, Special Education and ESO"],
  "Bachillerato": ["Batxillerat", "Bachillerato"],
  "Formación Profesional presencial": ["Formació Professional presencial", "Vocational training (FP), in person"],
  "Educación de Personas Adultas": ["Educació de Persones Adultes", "Adult Education"],
  "Infantil (3 a 6 años), Primaria, Educación Especial, ESO y Bachillerato": ["Infantil (de 3 a 6 anys), Primària, Educació Especial, ESO i Batxillerat", "Infant (ages 3 to 6), Primary, Special Education, ESO and Bachillerato"],
  "Formación Profesional": ["Formació Professional", "Vocational training (FP)"],
  "Escuelas de Educación Infantil (0 a 3 años)": ["Escoles d'Educació Infantil (de 0 a 3 anys)", "Nursery schools (ages 0 to 3)"],
  "Infantil, Primaria, Educación Especial, ESO y Bachillerato": ["Infantil, Primària, Educació Especial, ESO i Batxillerat", "Infant, Primary, Special Education, ESO and Bachillerato"],
  "Educación de adultos": ["Educació d'adults", "Adult education"],
  "Infantil y Primaria": ["Infantil i Primària", "Infant and Primary"],
  "ESO": ["ESO", "ESO"],
  "1.º de Bachillerato": ["1r de Batxillerat", "First year of Bachillerato"],
  "Formación Profesional (grado básico, medio y superior)": ["Formació Professional (grau bàsic, mitjà i superior)", "Vocational training (basic, intermediate and higher level)"],
  "Infantil, Primaria y Educación Especial": ["Infantil, Primària i Educació Especial", "Infant, Primary and Special Education"],
  "ESO, Bachillerato y Formación Profesional": ["ESO, Batxillerat i Formació Professional", "ESO, Bachillerato and vocational training (FP)"],
  "Artes Plásticas y Diseño y Personas Adultas": ["Arts Plàstiques i Disseny i Persones Adultes", "Art and Design, and Adult Education"],
  "Infantil (2.º ciclo), Primaria, Educación Especial y ESO": ["Infantil (2n cicle), Primària, Educació Especial i ESO", "Infant (second cycle), Primary, Special Education and ESO"],
  "Bachillerato (salvo 2.º), FP de Grado Básico, Medio y Superior": ["Batxillerat (tret de 2n), FP de Grau Bàsic, Mitjà i Superior", "Bachillerato (except second year), basic, intermediate and higher vocational training (FP)"],
  "Escuelas infantiles autonómicas (primer ciclo)": ["Escoles infantils autonòmiques (primer cicle)", "Regional nursery schools (first cycle)"],
  "Formación Profesional, Escuela Oficial de Idiomas y Artes Plásticas": ["Formació Professional, Escola Oficial d'Idiomes i Arts Plàstiques", "Vocational training (FP), Official Language School and Art"],
  "ESO y Bachillerato": ["ESO i Batxillerat", "ESO and Bachillerato"],
  "Formación de Personas Adultas": ["Formació de Persones Adultes", "Adult Education"],
  "FP de Grado Medio y Superior": ["FP de Grau Mitjà i Superior", "Intermediate and higher vocational training (FP)"],
  "FP de Grado Básico": ["FP de Grau Bàsic", "Basic vocational training (FP)"],
  "Primer ciclo de Infantil (centros de la Consejería)": ["Primer cicle d'Infantil (centres de la Conselleria)", "First cycle of Infant education (the regional department's own centres)"],
  "Infantil, Primaria, ESO, Bachillerato y 1.º de FP": ["Infantil, Primària, ESO, Batxillerat i 1r d'FP", "Infant, Primary, ESO, Bachillerato and first year of vocational training (FP)"],
  "2.º de FP (Grado Básico, Medio y Superior)": ["2n d'FP (Grau Bàsic, Mitjà i Superior)", "Second year of vocational training (basic, intermediate and higher)"],
  "Infantil, Primaria, ESO y Bachillerato": ["Infantil, Primària, ESO i Batxillerat", "Infant, Primary, ESO and Bachillerato"],
  "Formación Profesional a distancia": ["Formació Professional a distància", "Distance vocational training (FP)"],
  "Escuelas Infantiles y Casas de Niños (0 a 3 años)": ["Escoles Infantils i Casas de Niños (de 0 a 3 anys)", "Nursery schools and Casas de Niños (ages 0 to 3)"],
  "Infantil, Primaria, Educación Especial, ESO, FP de Grado Básico y Bachillerato": ["Infantil, Primària, Educació Especial, ESO, FP de Grau Bàsic i Batxillerat", "Infant, Primary, Special Education, ESO, basic vocational training (FP) and Bachillerato"],
  "FP presencial y Artes Plásticas y Diseño": ["FP presencial i Arts Plàstiques i Disseny", "In-person vocational training (FP), and Art and Design"],
  "Personas Adultas, Escuela Oficial de Idiomas y Música": ["Persones Adultes, Escola Oficial d'Idiomes i Música", "Adult Education, Official Language School and Music"],
  "ESO, FP de Grado Básico y Bachillerato": ["ESO, FP de Grau Bàsic i Batxillerat", "ESO, basic vocational training (FP) and Bachillerato"],
  "Escuelas infantiles de primer ciclo de la Comunidad": ["Escoles infantils de primer cicle de la Comunitat", "The Region's first-cycle nursery schools"],
  "ESO y 1.º de Bachillerato": ["ESO i 1r de Batxillerat", "ESO and first year of Bachillerato"],
  "FP de Grado Medio": ["FP de Grau Mitjà", "Intermediate vocational training (FP)"],
  "Infantil y Primaria (centros públicos)": ["Infantil i Primària (centres públics)", "Infant and Primary (state schools)"],
  "Infantil, Primaria y ESO": ["Infantil, Primària i ESO", "Infant, Primary and ESO"],

  // Official texts: how each is cited
  "Decreto 301/2009, de 14 de julio": ["Decret 301/2009, de 14 de juliol", "Decree 301/2009 of 14 July"],
  "Resolución de la Delegación Territorial en Almería": ["Resolució de la Delegació Territorial a Almeria", "Resolution of the Delegación Territorial in Almería"],
  "Resolución de la Delegación Territorial en Cádiz": ["Resolució de la Delegació Territorial a Cadis", "Resolution of the Delegación Territorial in Cádiz"],
  "Resolución de la Delegación Territorial en Córdoba": ["Resolució de la Delegació Territorial a Còrdova", "Resolution of the Delegación Territorial in Córdoba"],
  "Resolución de 27 de mayo de 2026 de la Delegación Territorial en Granada": ["Resolució de 27 de maig de 2026 de la Delegació Territorial a Granada", "Resolution of 27 May 2026 of the Delegación Territorial in Granada"],
  "Resolución de 29 de mayo de 2026 de la Delegación Territorial en Huelva": ["Resolució de 29 de maig de 2026 de la Delegació Territorial a Huelva", "Resolution of 29 May 2026 of the Delegación Territorial in Huelva"],
  "Resolución de 20 de mayo de 2026 de la Delegación Territorial en Málaga": ["Resolució de 20 de maig de 2026 de la Delegació Territorial a Màlaga", "Resolution of 20 May 2026 of the Delegación Territorial in Málaga"],
  "Resolución de la Delegación Territorial en Sevilla": ["Resolució de la Delegació Territorial a Sevilla", "Resolution of the Delegación Territorial in Seville"],
  "Resolución de 29 de abril de 2025": ["Resolució de 29 d'abril de 2025", "Resolution of 29 April 2025"],
  "Resolución de 13 de mayo de 2026": ["Resolució de 13 de maig de 2026", "Resolution of 13 May 2026"],
  "Resolución de 27 de marzo de 2026": ["Resolució de 27 de març de 2026", "Resolution of 27 March 2026"],
  "Resolución n.º 196/2026, de 17 de marzo": ["Resolució núm. 196/2026, de 17 de març", "Resolution no. 196/2026 of 17 March"],
  "Orden EDU/10/2026, de 24 de marzo": ["Ordre EDU/10/2026, de 24 de març", "Order EDU/10/2026 of 24 March"],
  "Orden EDU/478/2026, de 25 de mayo": ["Ordre EDU/478/2026, de 25 de maig", "Order EDU/478/2026 of 25 May"],
  "Orden 79/2026, de 26 de mayo": ["Ordre 79/2026, de 26 de maig", "Order 79/2026 of 26 May"],
  "Resolución de 19 de junio de 2026": ["Resolució de 19 de juny de 2026", "Resolution of 19 June 2026"],
  "Resolución de 25 de junio de 2026": ["Resolució de 25 de juny de 2026", "Resolution of 25 June 2026"],
  "Resolución de 24 de junio de 2026": ["Resolució de 24 de juny de 2026", "Resolution of 24 June 2026"],
  "Resolución de 11 de junio de 2026": ["Resolució d'11 de juny de 2026", "Resolution of 11 June 2026"],
  "Calendario escolar 2026-2027 de la Dirección Provincial de Ceuta": ["Calendari escolar 2026-2027 de la Direcció Provincial de Ceuta", "2026-2027 school calendar of the Ceuta Provincial Directorate"],
  "Resolución de 15 de junio de 2026": ["Resolució de 15 de juny de 2026", "Resolution of 15 June 2026"],
  "Orden de 4 de junio de 2026": ["Ordre de 4 de juny de 2026", "Order of 4 June 2026"],
  "Resolución 34/2026, de 14 de abril": ["Resolució 34/2026, de 14 d'abril", "Resolution 34/2026 of 14 April"],
  "Orden 2034/2026, de 25 de mayo": ["Ordre 2034/2026, de 25 de maig", "Order 2034/2026 of 25 May"],
  "Resolución de la Dirección General de Planificación y Gestión Educativa de 10 de junio de 2026": ["Resolució de la Direcció General de Planificació i Gestió Educativa de 10 de juny de 2026", "Resolution of the Directorate-General for Educational Planning and Management of 10 June 2026"],
  "Resolución de 8 de junio de 2026": ["Resolució de 8 de juny de 2026", "Resolution of 8 June 2026"],
  "Resolución 143/2026, de 31 de marzo": ["Resolució 143/2026, de 31 de març", "Resolution 143/2026 of 31 March"],
  "Resolución de 21 de abril de 2026 de la Viceconsejera de Políticas Educativas": ["Resolució de 21 d'abril de 2026 de la viceconsellera de Polítiques Educatives", "Resolution of 21 April 2026 of the Deputy Minister for Education Policy"],
  "Orden EDF/66/2026, de 22 de abril": ["Ordre EDF/66/2026, de 22 d'abril", "Order EDF/66/2026 of 22 April"],
  // Where a text is published when it is not in a bulletin
  "web de la Consejería de Desarrollo Educativo": ["web de la Conselleria de Desenvolupament Educatiu", "regional education department website"],
  "web de la Consejería": ["web de la Conselleria", "regional education department website"],
  "web del Ministerio de Educación": ["web del Ministeri d'Educació", "Ministry of Education website"],

  // Provinces
  "Almería": ["Almeria", "Almería"],
  "Cádiz": ["Cadis", "Cádiz"],
  "Córdoba": ["Còrdova", "Córdoba"],
  "Granada": ["Granada", "Granada"],
  "Huelva": ["Huelva", "Huelva"],
  "Jaén": ["Jaén", "Jaén"],
  "Málaga": ["Màlaga", "Málaga"],
  "Sevilla": ["Sevilla", "Seville"],
  "Albacete": ["Albacete", "Albacete"],
  "Ciudad Real": ["Ciudad Real", "Ciudad Real"],
  "Cuenca": ["Conca", "Cuenca"],
  "Guadalajara": ["Guadalajara", "Guadalajara"],
  "Toledo": ["Toledo", "Toledo"],

  // First and last day, when the text gives a margin
  "entre el 22 y el 24 de junio de 2027, según la provincia": ["entre el 22 i el 24 de juny de 2027, segons la província", "between 22 and 24 June 2027, depending on the province"],
  "entre el 4 y el 8 de septiembre de 2026, según el centro": ["entre el 4 i el 8 de setembre de 2026, segons el centre", "between 4 and 8 September 2026, depending on the school"],
  "entre el 18 y el 22 de junio de 2027, según el centro": ["entre el 18 i el 22 de juny de 2027, segons el centre", "between 18 and 22 June 2027, depending on the school"],
  "no antes del lunes 7 de septiembre de 2026": ["no abans del dilluns 7 de setembre de 2026", "no earlier than Monday 7 September 2026"],
  "no antes del jueves 3 de septiembre de 2026": ["no abans del dijous 3 de setembre de 2026", "no earlier than Thursday 3 September 2026"],
  "como muy tarde el viernes 18 de junio de 2027": ["com a molt tard el divendres 18 de juny de 2027", "no later than Friday 18 June 2027"],

  // Notes on a stage
  "el 21 de mayo en Córdoba y Huelva; después, clases de repaso hasta el fin de curso": ["el 21 de maig a Còrdova i Huelva; després, classes de repàs fins a final de curs", "21 May in Córdoba and Huelva; after that, revision classes until the end of term"],
  "alumnado que se gradúa; luego, actividades de preparación hasta la PAU": ["alumnat que es gradua; després, activitats de preparació fins a la PAU", "students who graduate; after that, preparation activities until the university entrance exam (PAU)"],
  "2.º de grado superior termina el 27 de mayo": ["2n de grau superior acaba el 27 de maig", "second year of higher level ends on 27 May"],
  "el alumnado de ESO escolarizado en colegios de Primaria empieza el 9 de septiembre": ["l'alumnat d'ESO escolaritzat en escoles de Primària comença el 9 de setembre", "ESO pupils taught in primary schools start on 9 September"],
  "2.º de Grado Superior empieza el 9 de septiembre": ["2n de Grau Superior comença el 9 de setembre", "second year of higher vocational training starts on 9 September"],
  "termina según las fechas de la prueba de acceso a la universidad": ["acaba segons les dates de la prova d'accés a la universitat", "ends according to the dates of the university entrance exam"],
  "en 2.º de Bachillerato la evaluación se programa según la prueba de acceso a la universidad": ["a 2n de Batxillerat l'avaluació es programa segons la prova d'accés a la universitat", "in second year of Bachillerato, assessment is scheduled around the university entrance exam"],
  "termina según las fechas de la PAU": ["acaba segons les dates de la PAU", "ends according to the dates of the university entrance exam (PAU)"],
  "en Bachillerato cada centro concreta el calendario de mayo y junio según las evaluaciones": ["a Batxillerat cada centre concreta el calendari de maig i juny segons les avaluacions", "in Bachillerato each school sets its May and June calendar around the assessments"],
  "termina según la prueba de acceso a la universidad": ["acaba segons la prova d'accés a la universitat", "ends according to the university entrance exam"],
  "2.º de Bachillerato se adapta a la prueba de acceso a la universidad": ["2n de Batxillerat s'adapta a la prova d'accés a la universitat", "second year of Bachillerato is adapted to the university entrance exam"],
  "2.º de Bachillerato termina según la evaluación final y la PAU": ["2n de Batxillerat acaba segons l'avaluació final i la PAU", "second year of Bachillerato ends according to the final assessment and the university entrance exam (PAU)"],
  "exámenes ordinarios hasta el 17 de mayo; después, preparación de la PAU": ["exàmens ordinaris fins al 17 de maig; després, preparació de la PAU", "ordinary exams until 17 May; after that, preparation for the university entrance exam (PAU)"],
  "fin de las clases; hasta el 18 de junio, pruebas y evaluaciones finales": ["final de les classes; fins al 18 de juny, proves i avaluacions finals", "end of classes; until 18 June, final tests and assessments"],
  "fin de las clases ordinarias; después, evaluaciones y preparación de la prueba de acceso": ["final de les classes ordinàries; després, avaluacions i preparació de la prova d'accés", "end of ordinary classes; after that, assessments and preparation for the entrance exam"],
  "empieza como muy tarde ese día": ["comença com a molt tard aquell dia", "starts on that day at the latest"],

  // Christmas and Easter: labels where the dates change by province
  "del 23 de diciembre (24 en Sevilla) al 6, 7 u 8 de enero, según la provincia": ["del 23 de desembre (24 a Sevilla) al 6, 7 o 8 de gener, segons la província", "23 December (24 in Seville) to 6, 7 or 8 January, depending on the province"],
  "23-24 dic – 6-8 ene": ["23-24 des – 6-8 gen", "23-24 Dec – 6-8 Jan"],
  "del 22 al 28 de marzo (en Almería, hasta el lunes 29)": ["del 22 al 28 de març (a Almeria, fins al dilluns 29)", "22 to 28 March (in Almería, until Monday 29)"],
  "22-28 mar (Almería, 22-29)": ["22-28 març (Almeria, 22-29)", "22-28 Mar (Almería, 22-29)"],

  // Christmas and Easter: what the text says
  "En Almería el lunes 29 de marzo también es no lectivo.": ["A Almeria el dilluns 29 de març tampoc no hi ha classe.", "In Almería, Monday 29 March is also a non-teaching day."],
  "vacaciones del 24 de diciembre al 6 de enero y el 23 de diciembre no lectivo": ["vacances del 24 de desembre al 6 de gener i el 23 de desembre no lectiu", "holidays from 24 December to 6 January, and 23 December a non-teaching day"],
  "vacaciones del 21 al 28 de marzo y el 29 de marzo no lectivo": ["vacances del 21 al 28 de març i el 29 de març no lectiu", "holidays from 21 to 28 March, and 29 March a non-teaching day"],
  "vacaciones del 23 de diciembre al 6 de enero y el 7 de enero no lectivo provincial": ["vacances del 23 de desembre al 6 de gener i el 7 de gener no lectiu provincial", "holidays from 23 December to 6 January, and 7 January a provincial non-teaching day"],
  "vacaciones del 24 de diciembre al 7 de enero y el 8 de enero no lectivo provincial": ["vacances del 24 de desembre al 7 de gener i el 8 de gener no lectiu provincial", "holidays from 24 December to 7 January, and 8 January a provincial non-teaching day"],
  "La resolución las cuenta desde el final de las clases de la mañana del martes 22 de diciembre: ese día solo hay clase por la mañana.": ["La resolució les compta des del final de les classes del matí del dimarts 22 de desembre: aquell dia només hi ha classe al matí.", "The resolution counts them from the end of morning classes on Tuesday 22 December: that day there is class in the morning only."],
  "La resolución las llama vacaciones de Pascua.": ["La resolució en diu vacances de Pasqua.", "The resolution calls them the Pascua (Easter) holidays."],
  "Son las fechas corregidas por la Resolución de 10 de abril de 2026 (BOC núm. 75): el texto original decía del 22 de diciembre al 7 de enero.": ["Són les dates corregides per la Resolució de 10 d'abril de 2026 (BOC núm. 75): el text original deia del 22 de desembre al 7 de gener.", "These are the dates as corrected by the Resolution of 10 April 2026 (BOC no. 75): the original text said 22 December to 7 January."],
  "La orden no da un periodo sino la lista de días: 23, 24, 28, 29, 30 y 31 de diciembre y 4, 5, 7 y 8 de enero, además de los festivos.": ["L'ordre no dona un període sinó la llista de dies: 23, 24, 28, 29, 30 i 31 de desembre i 4, 5, 7 i 8 de gener, a més dels festius.", "The order gives a list of days rather than a period: 23, 24, 28, 29, 30 and 31 December and 4, 5, 7 and 8 January, plus the public holidays."],
  "La orden declara no lectivos el 22, 23 y 24 de marzo, y el 25 y el 26 si no son festivos.": ["L'ordre declara no lectius el 22, 23 i 24 de març, i el 25 i el 26 si no són festius.", "The order makes 22, 23 and 24 March non-teaching days, and 25 and 26 March too if they are not public holidays."],
  "La orden fija el último día de clase, el martes 22 de diciembre, y la vuelta, el lunes 11 de enero.": ["L'ordre fixa l'últim dia de classe, el dimarts 22 de desembre, i la tornada, el dilluns 11 de gener.", "The order sets the last day of class, Tuesday 22 December, and the return, Monday 11 January."],
  "La orden fija el último día de clase, el viernes 19 de marzo, y la vuelta, el miércoles 31 de marzo.": ["L'ordre fixa l'últim dia de classe, el divendres 19 de març, i la tornada, el dimecres 31 de març.", "The order sets the last day of class, Friday 19 March, and the return, Wednesday 31 March."],
  "El calendario marca vacaciones de Navidad del 23 de diciembre al 7 de enero, y el 8 de enero como día de libre disposición.": ["El calendari marca vacances de Nadal del 23 de desembre al 7 de gener, i el 8 de gener com a dia de lliure disposició.", "The calendar shows Christmas holidays from 23 December to 7 January, and 8 January as a discretionary day off."],
  "El calendario marca Semana Santa del 22 al 26 de marzo, y del 29 de marzo al 2 de abril como días de libre disposición.": ["El calendari marca Setmana Santa del 22 al 26 de març, i del 29 de març al 2 d'abril com a dies de lliure disposició.", "The calendar shows Easter from 22 to 26 March, and 29 March to 2 April as discretionary days off."],
  "La orden fija las vacaciones del 23 de diciembre al 6 de enero y declara no lectivos el 7 y el 8 de enero.": ["L'ordre fixa les vacances del 23 de desembre al 6 de gener i declara no lectius el 7 i el 8 de gener.", "The order sets the holidays from 23 December to 6 January and makes 7 and 8 January non-teaching days."],
  "La orden fija las vacaciones del 20 al 28 de marzo y declara no lectivos el viernes 19 y el lunes 29.": ["L'ordre fixa les vacances del 20 al 28 de març i declara no lectius el divendres 19 i el dilluns 29.", "The order sets the holidays from 20 to 28 March and makes Friday 19 and Monday 29 non-teaching days."],
  "La resolución fija las vacaciones del 23 de diciembre al 7 de enero, y el 8 de enero como día de libre disposición.": ["La resolució fixa les vacances del 23 de desembre al 7 de gener, i el 8 de gener com a dia de lliure disposició.", "The resolution sets the holidays from 23 December to 7 January, and 8 January as a discretionary day off."],
  "La resolución fija la Semana Santa del 22 al 26 de marzo, y del 29 de marzo al 2 de abril como días de libre disposición.": ["La resolució fixa la Setmana Santa del 22 al 26 de març, i del 29 de març al 2 d'abril com a dies de lliure disposició.", "The resolution sets Easter from 22 to 26 March, and 29 March to 2 April as discretionary days off."],
  "La resolución fija las vacaciones del 24 de diciembre al 6 de enero y declara no lectivo el 23 de diciembre en toda la Región.": ["La resolució fixa les vacances del 24 de desembre al 6 de gener i declara no lectiu el 23 de desembre a tota la Regió.", "The resolution sets the holidays from 24 December to 6 January and makes 23 December a non-teaching day across the Region."],
  "El 22 de diciembre solo hay clase por la mañana.": ["El 22 de desembre només hi ha classe al matí.", "On 22 December there is class in the morning only."],
  "El 24 de marzo solo hay clase por la mañana.": ["El 24 de març només hi ha classe al matí.", "On 24 March there is class in the morning only."],
  "Es el mínimo: cada centro puede alargarlas en su calendario.": ["És el mínim: cada centre les pot allargar en el seu calendari.", "This is the minimum: each school can extend them in its own calendar."],
  "Es el mínimo, de Jueves Santo a Lunes de Pascua: cada centro puede alargarlas.": ["És el mínim, de Dijous Sant a Dilluns de Pasqua: cada centre les pot allargar.", "This is the minimum, from Maundy Thursday to Easter Monday: each school can extend them."],

  // Other breaks
  "Semana Blanca": ["Setmana Blanca", "Semana Blanca (winter half-term)"],
  "con el lunes 1 de marzo, festivo, se vuelve el martes 2": ["amb el dilluns 1 de març, festiu, es torna el dimarts 2", "with Monday 1 March a public holiday, school resumes on Tuesday 2"],
  "Carnaval": ["Carnaval", "Carnival"],
  "Puente de mayo": ["Pont de maig", "May long weekend"],
  "Fiesta escolar unificada y Día de las Illes Balears": ["Festa escolar unificada i Dia de les Illes Balears", "Unified school holiday and Balearic Islands Day"],
  "viernes 26 de febrero, no lectivo, y lunes 1 de marzo, festivo": ["divendres 26 de febrer, no lectiu, i dilluns 1 de març, festiu", "Friday 26 February, a non-teaching day, and Monday 1 March, a public holiday"],
  "Vacaciones de otoño": ["Vacances de tardor", "Autumn holidays"],
  "Vacaciones de invierno": ["Vacances d'hivern", "Winter holidays"],
  "Vacaciones de primavera": ["Vacances de primavera", "Spring holidays"],
  "Días de libre disposición (Carnaval)": ["Dies de lliure disposició (Carnaval)", "Discretionary days off (Carnival)"],
  "los ayuntamientos pueden trasladarlos; no se aplican en las escuelas infantiles autonómicas": ["els ajuntaments els poden traslladar; no s'apliquen a les escoles infantils autonòmiques", "town councils can move them; they do not apply in the regional nursery schools"],
  "Carnavales": ["Carnaval", "Carnival"],
  "Entroido (Carnaval)": ["Entroido (Carnaval)", "Entroido (Carnival)"],
  "Días no lectivos de febrero": ["Dies no lectius de febrer", "February non-teaching days"],
  "viernes 12 y lunes 15 de febrero": ["divendres 12 i dilluns 15 de febrer", "Friday 12 and Monday 15 February"],

  // Single days without class: why, and for whom
  "día no lectivo provincial": ["dia no lectiu provincial", "provincial non-teaching day"],
  "Día de la Comunidad Educativa": ["Dia de la Comunitat Educativa", "Education Community Day"],
  "vacaciones provinciales": ["vacances provincials", "provincial holidays"],
  "en la provincia de Zaragoza": ["a la província de Saragossa", "in the province of Zaragoza"],
  "en las provincias de Huesca y Teruel": ["a les províncies d'Osca i Terol", "in the provinces of Huesca and Teruel"],
  "en la provincia de Teruel": ["a la província de Terol", "in the province of Teruel"],
  "en las provincias de Huesca y Zaragoza": ["a les províncies d'Osca i Saragossa", "in the provinces of Huesca and Zaragoza"],
  "día no lectivo": ["dia no lectiu", "non-teaching day"],
  "Día del Enseñante y del Estudiante": ["Dia de l'Ensenyant i de l'Estudiant", "Teachers' and Students' Day"],
  "fiesta insular": ["festa insular", "island holiday"],
  "en Lanzarote y La Graciosa": ["a Lanzarote i La Graciosa", "on Lanzarote and La Graciosa"],
  "en Fuerteventura": ["a Fuerteventura", "on Fuerteventura"],
  "en El Hierro": ["a El Hierro", "on El Hierro"],
  "en La Gomera": ["a La Gomera", "on La Gomera"],
  "fiesta insular de la Candelaria": ["festa insular de la Candelera", "island holiday of La Candelaria"],
  "en Tenerife": ["a Tenerife", "on Tenerife"],
  "Día del Docente": ["Dia del Docent", "Teachers' Day"],
  "Día de la Enseñanza": ["Dia de l'Ensenyament", "Education Day"],
  "día de libre disposición": ["dia de lliure disposició", "discretionary day off"],
  "día de fiesta en el calendario escolar": ["dia de festa al calendari escolar", "holiday in the school calendar"],
  "Santa Cecilia": ["Santa Cecília", "St Cecilia's Day"],
  "en los conservatorios oficiales de música": ["als conservatoris oficials de música", "in the official music conservatories"],
  "en todas las enseñanzas salvo los conservatorios": ["a tots els ensenyaments tret dels conservatoris", "in all studies except the conservatories"],
  "Día de Melilla": ["Dia de Melilla", "Melilla Day"],
  "fiesta del patrón": ["festa del patró", "patron saint's day"],
  "en Infantil, Primaria y Educación Especial": ["a Infantil, Primària i Educació Especial", "in Infant, Primary and Special Education"],
  "en ESO, Bachillerato, Adultos, Idiomas y FP de Grado Básico": ["a ESO, Batxillerat, Adults, Idiomes i FP de Grau Bàsic", "in ESO, Bachillerato, Adult Education, Languages and basic vocational training (FP)"],
  "en Formación Profesional": ["a Formació Professional", "in vocational training (FP)"],
  "San Francisco Javier": ["Sant Francesc Xavier", "St Francis Xavier's Day"],
  "fiesta patronal (cada centro puede cambiarla de día)": ["festa patronal (cada centre la pot canviar de dia)", "patron saint's day (each school can move it to another day)"],
  "en Infantil, Primaria, Educación Especial y ESO de los colegios": ["a Infantil, Primària, Educació Especial i ESO de les escoles", "in Infant, Primary, Special Education and ESO taught in primary schools"],
  "en ESO de los institutos y en Bachillerato": ["a ESO dels instituts i a Batxillerat", "in ESO taught in secondary schools and in Bachillerato"],

  // Hub table: the "other breaks" cell where it is not one period
  "Málaga: Semana Blanca, 22-26 feb": ["Màlaga: Setmana Blanca, 22-26 febr", "Málaga: Semana Blanca, 22-26 Feb"],
  "Por provincias: Huesca y Teruel 18-19 feb; Zaragoza 13-14 oct": ["Per províncies: Osca i Terol 18-19 febr; Saragossa 13-14 oct", "By province: Huesca and Teruel 18-19 Feb; Zaragoza 13-14 Oct"],
  // A municipality's days, corrected after publication
  "corregido en el BORM de 22 de julio de 2026": ["corregit al BORM de 22 de juliol de 2026", "corrected in the BORM of 22 July 2026"],

  // Andalusia
  "No hay clase en las fiestas locales de cada municipio (dos como máximo). Cuántos días más puede fijar cada localidad, quién los propone (ayuntamiento, Consejo Escolar Municipal o consejo escolar del centro) y hasta cuándo lo dice la resolución de cada provincia: está en la tabla por provincias.": [
    "No hi ha classe les festes locals de cada municipi (dues com a màxim). Quants dies més pot fixar cada localitat, qui els proposa (ajuntament, Consell Escolar Municipal o consell escolar del centre) i fins quan, ho diu la resolució de cada província: és a la taula per províncies.",
    "There is no class on each municipality's local holidays (two at most). How many more days each town can set, who proposes them (the town council, the Municipal School Council or the school's own council) and by when is laid down in each province's resolution: see the table by province.",
  ],
  "En todas las provincias leídas el curso tiene 178 días lectivos en Infantil y Primaria y 175 en ESO, Bachillerato y FP.": [
    "A totes les províncies llegides el curs té 178 dies lectius a Infantil i Primària i 175 a ESO, Batxillerat i FP.",
    "In every province read, the school year has 178 teaching days in Infant and Primary and 175 in ESO, Bachillerato and vocational training (FP).",
  ],
  "El 26 de febrero de 2027, Día de la Comunidad Educativa, no hay clase en Almería, Córdoba, Granada, Huelva, Málaga y Sevilla; Cádiz lo pasa al 30 de abril.": [
    "El 26 de febrer de 2027, Dia de la Comunitat Educativa, no hi ha classe a Almeria, Còrdova, Granada, Huelva, Màlaga i Sevilla; Cadis el passa al 30 d'abril.",
    "On 26 February 2027, Education Community Day, there is no class in Almería, Córdoba, Granada, Huelva, Málaga and Seville; Cádiz moves it to 30 April.",
  ],
  "Las resoluciones provinciales no se publican en el BOJA: están en la web de la Consejería, en la página de cada Delegación Territorial.": [
    "Les resolucions provincials no es publiquen al BOJA: són al web de la Conselleria, a la pàgina de cada Delegació Territorial.",
    "The provincial resolutions are not published in the BOJA: they are on the regional education department's website, on the page of each Delegación Territorial (provincial office).",
  ],
  "Todas empiezan el 10 de septiembre y tienen la Semana Santa del 22 al 28 de marzo, pero la Navidad y el último día cambian de una provincia a otra.": [
    "Totes comencen el 10 de setembre i tenen la Setmana Santa del 22 al 28 de març, però el Nadal i l'últim dia canvien d'una província a l'altra.",
    "All of them start on 10 September and have Easter from 22 to 28 March, but Christmas and the last day change from one province to another.",
  ],
  "Si las fiestas locales caen en día lectivo, los consejos escolares piden a la Delegación cambiarlas por alguno de los días no lectivos provinciales (9 y 30 de octubre, 23 de diciembre, 26 de febrero, 29 de marzo, 30 de abril), antes del 1 de febrero de 2027.": [
    "Si les festes locals cauen en dia lectiu, els consells escolars demanen a la Delegació canviar-les per algun dels dies no lectius provincials (9 i 30 d'octubre, 23 de desembre, 26 de febrer, 29 de març, 30 d'abril), abans de l'1 de febrer de 2027.",
    "If the local holidays fall on teaching days, school councils ask the provincial office to swap them for one of the provincial non-teaching days (9 and 30 October, 23 December, 26 February, 29 March, 30 April), before 1 February 2027.",
  ],
  "Cada ayuntamiento puede pedir a la Delegación, tras consultar al Consejo Escolar Municipal, hasta tres días no lectivos si sus fiestas locales no caen en periodo lectivo (plazo: 30 de septiembre de 2026).": [
    "Cada ajuntament pot demanar a la Delegació, després de consultar el Consell Escolar Municipal, fins a tres dies no lectius si les seves festes locals no cauen en període lectiu (termini: 30 de setembre de 2026).",
    "Each town council can ask the provincial office, after consulting the Municipal School Council, for up to three non-teaching days if its local holidays do not fall in term time (deadline: 30 September 2026).",
  ],
  "Cada ayuntamiento puede pedir a la Delegación, tras consultar al Consejo Escolar Municipal, hasta tres días no lectivos si sus fiestas locales no caen en periodo lectivo.": [
    "Cada ajuntament pot demanar a la Delegació, després de consultar el Consell Escolar Municipal, fins a tres dies no lectius si les seves festes locals no cauen en període lectiu.",
    "Each town council can ask the provincial office, after consulting the Municipal School Council, for up to three non-teaching days if its local holidays do not fall in term time.",
  ],
  "Además de las fiestas locales, los consejos escolares municipales pueden fijar hasta tres días no lectivos: tres si ninguna fiesta local cae en periodo lectivo, dos si cae una y uno si caen las dos.": [
    "A més de les festes locals, els consells escolars municipals poden fixar fins a tres dies no lectius: tres si cap festa local cau en període lectiu, dos si n'hi cau una i un si hi cauen totes dues.",
    "On top of the local holidays, municipal school councils can set up to three non-teaching days: three if neither local holiday falls in term time, two if one does and one if both do.",
  ],
  "Los consejos escolares municipales fijan los días vacacionales locales: cinco, que incluyen las dos fiestas locales si caen en periodo lectivo.": [
    "Els consells escolars municipals fixen els dies de vacances locals: cinc, que inclouen les dues festes locals si cauen en període lectiu.",
    "Municipal school councils set the local days off: five, which include the two local holidays if they fall in term time.",
  ],
  "La resolución fija los días según dónde caigan las fiestas locales: si ninguna cae en periodo lectivo, no hay clase el 29 de marzo y el 3 de mayo; si cae una, esa fiesta y el 3 de mayo; si caen las dos, solo ellas.": [
    "La resolució fixa els dies segons on caiguin les festes locals: si cap cau en període lectiu, no hi ha classe el 29 de març i el 3 de maig; si n'hi cau una, aquella festa i el 3 de maig; si hi cauen totes dues, només elles.",
    "The resolution sets the days according to where the local holidays fall: if neither falls in term time, there is no class on 29 March and 3 May; if one does, that holiday and 3 May; if both do, only those two.",
  ],
  "Los consejos escolares municipales acuerdan hasta dos días de libre disposición y los proponen a la Delegación antes del 15 de octubre de 2026.": [
    "Els consells escolars municipals acorden fins a dos dies de lliure disposició i els proposen a la Delegació abans del 15 d'octubre de 2026.",
    "Municipal school councils agree up to two discretionary days off and propose them to the provincial office before 15 October 2026.",
  ],

  // Aragon
  "Además de los días de cada provincia, no hay clase en las dos fiestas locales del calendario laboral de cada localidad. El ayuntamiento comunica sus fechas al Servicio Provincial antes del 1 de septiembre; si alguna cae en día no lectivo, señala (oído el Consejo Escolar Municipal o, si no lo hay, los consejos escolares de los centros) el día lectivo que la sustituye. También puede cambiar los días provinciales por otros para ampliar sus fiestas.": [
    "A més dels dies de cada província, no hi ha classe les dues festes locals del calendari laboral de cada localitat. L'ajuntament comunica les seves dates al Servei Provincial abans de l'1 de setembre; si alguna cau en dia no lectiu, assenyala (escoltat el Consell Escolar Municipal o, si no n'hi ha, els consells escolars dels centres) el dia lectiu que la substitueix. També pot canviar els dies provincials per uns altres per ampliar les seves festes.",
    "On top of each province's days, there is no class on the two local holidays in each town's work calendar. The town council sends its dates to the Provincial Service before 1 September; if one falls on a non-teaching day, it names the teaching day that replaces it, after hearing the Municipal School Council or, where there is none, the schools' councils. It can also swap the provincial days for others to lengthen its own festivities.",
  ],
  "Una sola resolución aprueba los calendarios de 2025-2026 y 2026-2027. El curso 2026-2027 tiene 176 días lectivos en Infantil, Primaria, Educación Especial y ESO.": [
    "Una sola resolució aprova els calendaris de 2025-2026 i 2026-2027. El curs 2026-2027 té 176 dies lectius a Infantil, Primària, Educació Especial i ESO.",
    "A single resolution approves the calendars for 2025-2026 and 2026-2027. The 2026-2027 school year has 176 teaching days in Infant, Primary, Special Education and ESO.",
  ],
  "Del martes 8 al martes 15 de septiembre de 2026 y todos los días lectivos de junio de 2027, los colegios de Infantil, Primaria y Educación Especial sostenidos con fondos públicos tienen jornada continuada reducida de mañana.": [
    "Del dimarts 8 al dimarts 15 de setembre de 2026 i tots els dies lectius de juny de 2027, les escoles d'Infantil, Primària i Educació Especial sostingudes amb fons públics fan jornada continuada reduïda de matí.",
    "From Tuesday 8 to Tuesday 15 September 2026 and on every teaching day in June 2027, publicly funded Infant, Primary and Special Education schools have a shortened, mornings-only day.",
  ],
  "El Día de la Educación en Aragón es el miércoles 24 de marzo de 2027, y es lectivo.": [
    "El Dia de l'Educació a l'Aragó és el dimecres 24 de març de 2027, i és lectiu.",
    "Education Day in Aragon is Wednesday 24 March 2027, and it is a teaching day.",
  ],

  // Asturias
  "Los dos festivos locales del calendario laboral de cada municipio son no lectivos. Si alguno cae en un día que ya no tiene clase, los consejos escolares de los centros de la localidad (o el Consejo Escolar Municipal, si existe) fijan de común acuerdo el día que lo sustituye, que no puede estar pegado a unas vacaciones o a otro día no lectivo.": [
    "Els dos festius locals del calendari laboral de cada municipi són no lectius. Si algun cau en un dia que ja no té classe, els consells escolars dels centres de la localitat (o el Consell Escolar Municipal, si n'hi ha) fixen de comú acord el dia que el substitueix, que no pot anar enganxat a unes vacances o a un altre dia no lectiu.",
    "The two local holidays in each municipality's work calendar are non-teaching days. If one falls on a day that already has no class, the councils of the town's schools (or the Municipal School Council, where there is one) jointly set the day that replaces it, which cannot be next to a holiday period or another non-teaching day.",
  ],
  "Con la aprobación del consejo escolar, los centros de Infantil, Primaria y Educación Especial pueden tener jornada reducida en septiembre y junio, de al menos cuatro horas lectivas. Los de jornada partida pueden hacer jornada continua el día anterior a cada periodo de vacaciones.": [
    "Amb l'aprovació del consell escolar, els centres d'Infantil, Primària i Educació Especial poden fer jornada reduïda al setembre i al juny, d'almenys quatre hores lectives. Els de jornada partida poden fer jornada contínua el dia abans de cada període de vacances.",
    "With the school council's approval, Infant, Primary and Special Education schools can have a shortened day in September and June, of at least four teaching hours. Schools with a split day can run a continuous day on the day before each holiday period.",
  ],
  "Las escuelas de Educación Infantil de 0 a 3 años tienen sus propios días no lectivos (anexo II de la resolución).": [
    "Les escoles d'Educació Infantil de 0 a 3 anys tenen els seus propis dies no lectius (annex II de la resolució).",
    "Nursery schools for ages 0 to 3 have their own non-teaching days (annex II of the resolution).",
  ],

  // Balearic Islands
  "Son festivas las dos fiestas locales de cada municipio. Si una o las dos caen en día no lectivo, el centro puede fijar tantos días sustitutorios como coincidencias (dos como máximo). Además, cada centro puede establecer dos días festivos de libre disposición; los consejos escolares municipales deben procurar que todos los centros del municipio elijan los mismos.": [
    "Són festives les dues festes locals de cada municipi. Si una o totes dues cauen en dia no lectiu, el centre pot fixar tants dies substitutoris com coincidències (dos com a màxim). A més, cada centre pot establir dos dies festius de lliure disposició; els consells escolars municipals han de procurar que tots els centres del municipi triïn els mateixos.",
    "Each municipality's two local holidays are days off. If one or both fall on a non-teaching day, the school can set as many replacement days as there are clashes (two at most). In addition, each school can set two discretionary days off; municipal school councils must try to have every school in the municipality choose the same ones.",
  ],
  "176 días lectivos en Infantil, Primaria, Educación Especial, Secundaria y Bachillerato. El primer ciclo de Infantil (0 a 3 años) sigue las mismas fechas.": [
    "176 dies lectius a Infantil, Primària, Educació Especial, Secundària i Batxillerat. El primer cicle d'Infantil (de 0 a 3 anys) segueix les mateixes dates.",
    "176 teaching days in Infant, Primary, Special Education, Secondary and Bachillerato. The first cycle of Infant education (ages 0 to 3) follows the same dates.",
  ],
  "El 22 de diciembre y el 24 de marzo, los centros con jornada partida pueden concentrar las clases en un solo periodo.": [
    "El 22 de desembre i el 24 de març, els centres amb jornada partida poden concentrar les classes en un sol període.",
    "On 22 December and 24 March, schools with a split day can concentrate classes into a single session.",
  ],
  "Una resolución de 25 de junio de 2026 (BOIB núm. 82) modificó la redacción sobre horarios y autorizaciones, sin cambiar ninguna fecha.": [
    "Una resolució de 25 de juny de 2026 (BOIB núm. 82) va modificar la redacció sobre horaris i autoritzacions, sense canviar cap data.",
    "A resolution of 25 June 2026 (BOIB no. 82) changed the wording on timetables and authorisations, without changing any date.",
  ],

  // Canary Islands
  "Además de los festivos (también los insulares de cada isla y los locales de cada municipio), el consejo escolar de cada centro, oído el Consejo Escolar Municipal donde lo haya, puede fijar hasta cuatro días no lectivos de libre disposición, sin dejar un solo día lectivo suelto en una semana. Las fechas se comunican antes del 31 de octubre de 2026, y los centros que comparten transporte o comedor deben acordar un calendario común.": [
    "A més dels festius (també els insulars de cada illa i els locals de cada municipi), el consell escolar de cada centre, escoltat el Consell Escolar Municipal on n'hi hagi, pot fixar fins a quatre dies no lectius de lliure disposició, sense deixar un sol dia lectiu solt en una setmana. Les dates es comuniquen abans del 31 d'octubre de 2026, i els centres que comparteixen transport o menjador han d'acordar un calendari comú.",
    "On top of the public holidays (including each island's own and each municipality's local ones), each school's council, after hearing the Municipal School Council where there is one, can set up to four discretionary non-teaching days, without leaving a single teaching day stranded in a week. The dates are notified before 31 October 2026, and schools that share transport or a canteen must agree a common calendar.",
  ],
  "En Infantil (2.º ciclo), Primaria y Educación Especial hay jornada intensiva desde el inicio de las clases hasta el 11 de septiembre y a partir del 14 de junio.": [
    "A Infantil (2n cicle), Primària i Educació Especial hi ha jornada intensiva des de l'inici de les classes fins a l'11 de setembre i a partir del 14 de juny.",
    "In Infant (second cycle), Primary and Special Education there is a shortened continuous day from the start of classes until 11 September and from 14 June.",
  ],
  "Si el día de inicio de una enseñanza es festivo en el municipio o la isla, las clases empiezan el siguiente día lectivo.": [
    "Si el dia d'inici d'un ensenyament és festiu al municipi o a l'illa, les classes comencen el dia lectiu següent.",
    "If the start date of a course is a holiday in the municipality or on the island, classes start on the next teaching day.",
  ],
  "La fiesta insular de Tenerife de 2027 (2 de febrero, Candelaria) sale del calendario de fiestas laborales de Canarias para 2027 (Decreto 115/2026), al que remite la resolución.": [
    "La festa insular de Tenerife de 2027 (2 de febrer, la Candelera) surt del calendari de festes laborals de Canàries per al 2027 (Decret 115/2026), al qual remet la resolució.",
    "Tenerife's island holiday in 2027 (2 February, La Candelaria) comes from the Canary Islands' calendar of public holidays for 2027 (Decree 115/2026), to which the resolution refers.",
  ],

  // Cantabria
  "No hay días de libre disposición. Las fiestas locales no tienen clase, pero cuando un día lectivo es festivo (local, autonómico o nacional) el curso de Infantil, Primaria, ESO y Bachillerato termina los días necesarios más tarde para llegar al mínimo de días lectivos: el centro comunica la nueva fecha de fin a la inspección y a las familias.": [
    "No hi ha dies de lliure disposició. Les festes locals no tenen classe, però quan un dia lectiu és festiu (local, autonòmic o estatal) el curs d'Infantil, Primària, ESO i Batxillerat acaba els dies necessaris més tard per arribar al mínim de dies lectius: el centre comunica la nova data de final a la inspecció i a les famílies.",
    "There are no discretionary days off. There is no class on local holidays, but when a teaching day is a public holiday (local, regional or national) the year in Infant, Primary, ESO and Bachillerato ends as many days later as needed to reach the minimum number of teaching days: the school tells the inspectorate and families the new end date.",
  ],
  "175 días lectivos en Infantil, Primaria, Educación Especial y Secundaria.": [
    "175 dies lectius a Infantil, Primària, Educació Especial i Secundària.",
    "175 teaching days in Infant, Primary, Special Education and Secondary.",
  ],
  "En septiembre de 2026 y junio de 2027, Infantil, Primaria y Educación Especial tienen cuatro horas de clase al día; en los centros públicos la Consejería garantiza la atención del alumnado que se quede la hora siguiente, y el comedor y el transporte se adaptan.": [
    "El setembre de 2026 i el juny de 2027, Infantil, Primària i Educació Especial tenen quatre hores de classe al dia; als centres públics la Conselleria garanteix l'atenció de l'alumnat que es quedi l'hora següent, i el menjador i el transport s'hi adapten.",
    "In September 2026 and June 2027, Infant, Primary and Special Education have four hours of class a day; in state schools the regional department guarantees care for pupils who stay for the following hour, and the canteen and transport are adjusted.",
  ],

  // Castile and León
  "Son festivos los dos días de fiesta local de cada municipio, publicados en el boletín oficial de la provincia, si caen dentro del curso. La orden no da días de libre elección; las peticiones de cambio de calendario de los centros las resuelven las direcciones provinciales de educación.": [
    "Són festius els dos dies de festa local de cada municipi, publicats al butlletí oficial de la província, si cauen dins del curs. L'ordre no dona dies de lliure elecció; les peticions de canvi de calendari dels centres les resolen les direccions provincials d'educació.",
    "Each municipality's two local holidays, published in the province's official bulletin, are days off if they fall within the school year. The order gives no days of free choice; schools' requests to change the calendar are decided by the provincial education directorates.",
  ],
  "En septiembre de 2026 y junio de 2027, los centros de Infantil (2.º ciclo), Primaria y Educación Especial tienen jornada continua de cuatro horas por la mañana.": [
    "El setembre de 2026 i el juny de 2027, els centres d'Infantil (2n cicle), Primària i Educació Especial fan jornada contínua de quatre hores al matí.",
    "In September 2026 and June 2027, Infant (second cycle), Primary and Special Education schools have a continuous four-hour morning.",
  ],
  "2.º de Bachillerato termina las clases el 21 de mayo de 2027; sus pruebas extraordinarias son entre el 16 y el 22 de junio.": [
    "2n de Batxillerat acaba les classes el 21 de maig de 2027; les seves proves extraordinàries són entre el 16 i el 22 de juny.",
    "Second year of Bachillerato finishes classes on 21 May 2027; its resit exams are between 16 and 22 June.",
  ],
  "El primer ciclo de Infantil (0 a 3 años) no lo regula esta orden.": [
    "El primer cicle d'Infantil (de 0 a 3 anys) no el regula aquesta ordre.",
    "The first cycle of Infant education (ages 0 to 3) is not covered by this order.",
  ],

  // Castile-La Mancha
  "No hay clase en las dos fiestas locales de cada ayuntamiento, publicadas en el Boletín Oficial de la Provincia. Si una cae en un periodo sin clase, el ayuntamiento puede pedir a la Delegación Provincial, antes del 30 de noviembre de 2026 y con informe favorable del Consejo Escolar de Localidad, que se declaren no lectivas otras fechas; también puede trasladar los dos días de libre disposición del 8 y 9 de febrero.": [
    "No hi ha classe les dues festes locals de cada ajuntament, publicades al Butlletí Oficial de la Província. Si una cau en un període sense classe, l'ajuntament pot demanar a la Delegació Provincial, abans del 30 de novembre de 2026 i amb informe favorable del Consell Escolar de Localitat, que es declarin no lectives altres dates; també pot traslladar els dos dies de lliure disposició del 8 i 9 de febrer.",
    "There is no class on each town council's two local holidays, published in the province's official bulletin. If one falls in a period without class, the council can ask the Provincial Delegation, before 30 November 2026 and with a favourable report from the local school council, to make other dates non-teaching days; it can also move the two discretionary days of 8 and 9 February.",
  ],
  "Los centros de Infantil, Primaria y Educación Especial pueden hacer jornada única en septiembre y junio.": [
    "Els centres d'Infantil, Primària i Educació Especial poden fer jornada única al setembre i al juny.",
    "Infant, Primary and Special Education schools can run a single-session day in September and June.",
  ],
  "Los días de libre disposición del 8 y 9 de febrero se mantienen siempre que se cumpla el mínimo de 175 días lectivos.": [
    "Els dies de lliure disposició del 8 i 9 de febrer es mantenen sempre que es compleixi el mínim de 175 dies lectius.",
    "The discretionary days of 8 and 9 February stand as long as the minimum of 175 teaching days is met.",
  ],
  "Las cinco resoluciones provinciales repiten las fechas de la Orden 79/2026 (inicio, Navidad, Semana Santa, días no lectivos y fin de curso); lo que cambia de una provincia a otra es cómo se fijan los días locales. En Ciudad Real, Cuenca y Toledo, si un ayuntamiento no propone a tiempo sus días, pasan a ser el 21 y/o el 22 de junio.": [
    "Les cinc resolucions provincials repeteixen les dates de l'Ordre 79/2026 (inici, Nadal, Setmana Santa, dies no lectius i final de curs); el que canvia d'una província a l'altra és com es fixen els dies locals. A Ciudad Real, Conca i Toledo, si un ajuntament no proposa a temps els seus dies, passen a ser el 21 i/o el 22 de juny.",
    "The five provincial resolutions repeat the dates of Order 79/2026 (start, Christmas, Easter, non-teaching days and end of term); what changes from one province to another is how the local days are set. In Ciudad Real, Cuenca and Toledo, if a town council does not propose its days in time, they become 21 and/or 22 June.",
  ],

  // Ceuta
  "En Ceuta no hay días que elija cada centro: el calendario de la Dirección Provincial fija para todos los mismos días de libre disposición (2 y 3 de noviembre, 7 de diciembre, 8 de enero, 12 de febrero, del 29 de marzo al 2 de abril y 18 de mayo). Una vez aprobado, solo puede cambiarse con autorización expresa de la Dirección Provincial.": [
    "A Ceuta no hi ha dies que triï cada centre: el calendari de la Direcció Provincial fixa per a tothom els mateixos dies de lliure disposició (2 i 3 de novembre, 7 de desembre, 8 de gener, 12 de febrer, del 29 de març al 2 d'abril i 18 de maig). Un cop aprovat, només es pot canviar amb autorització expressa de la Direcció Provincial.",
    "In Ceuta there are no days chosen by each school: the Provincial Directorate's calendar sets the same discretionary days off for everyone (2 and 3 November, 7 December, 8 January, 12 February, 29 March to 2 April and 18 May). Once approved, it can only be changed with the Provincial Directorate's express authorisation.",
  ],
  "La fuente es el calendario gráfico que publica la Dirección Provincial en la web del Ministerio; no hay una resolución en un boletín.": [
    "La font és el calendari gràfic que publica la Direcció Provincial al web del Ministeri; no hi ha cap resolució en un butlletí.",
    "The source is the calendar chart the Provincial Directorate publishes on the Ministry's website; there is no resolution in an official bulletin.",
  ],
  "Las actividades académicas terminan el 30 de junio de 2027.": [
    "Les activitats acadèmiques acaben el 30 de juny de 2027.",
    "Academic activities end on 30 June 2027.",
  ],

  // Valencian Community
  "Cada ayuntamiento, con el acuerdo previo de su consejo escolar municipal, puede proponer hasta tres días no lectivos de carácter local (Fallas, fiestas patronales...). Por eso el calendario real cambia de un municipio a otro: para el tuyo, pregunta en el ayuntamiento o en el centro.": [
    "Cada ajuntament, amb l'acord previ del seu consell escolar municipal, pot proposar fins a tres dies no lectius de caràcter local (Falles, festes patronals...). Per això el calendari real canvia d'un municipi a l'altre: per al teu, pregunta a l'ajuntament o al centre.",
    "Each town council, with the prior agreement of its municipal school council, can propose up to three local non-teaching days (Fallas, patron saint festivities...). That is why the actual calendar changes from one municipality to another: for yours, ask the town council or the school.",
  ],
  "La resolución no fija vacaciones de Carnaval ni otros días no lectivos para toda la Comunitat aparte de los festivos.": [
    "La resolució no fixa vacances de Carnaval ni altres dies no lectius per a tota la Comunitat a banda dels festius.",
    "The resolution sets no Carnival holidays or other non-teaching days for the whole region apart from the public holidays.",
  ],

  // Extremadura
  "No hay clase en las fiestas locales que fija cada ayuntamiento. Si una o las dos caen en días sin clase, los consejos escolares de los centros de la localidad (o el Consejo Escolar Municipal, si existe) pueden fijar de común acuerdo días lectivos que las sustituyan, que no pueden estar pegados al principio o al final del curso, y deben comunicarlos a la Delegación Provincial antes del 30 de septiembre (primer trimestre) o del 31 de enero (resto del curso).": [
    "No hi ha classe les festes locals que fixa cada ajuntament. Si una o totes dues cauen en dies sense classe, els consells escolars dels centres de la localitat (o el Consell Escolar Municipal, si n'hi ha) poden fixar de comú acord dies lectius que les substitueixin, que no poden anar enganxats al principi o al final del curs, i els han de comunicar a la Delegació Provincial abans del 30 de setembre (primer trimestre) o del 31 de gener (resta del curs).",
    "There is no class on the local holidays set by each town council. If one or both fall on days without class, the councils of the town's schools (or the Municipal School Council, where there is one) can jointly set teaching days to replace them, which cannot be next to the start or the end of the school year, and must notify the Provincial Delegation before 30 September (first term) or 31 January (rest of the year).",
  ],
  "El primer ciclo de Infantil tiene calendario propio: además, no son lectivos el 28, 29 y 30 de diciembre, el 4 y 5 de enero y el 22, 23 y 24 de marzo.": [
    "El primer cicle d'Infantil té calendari propi: a més, no són lectius el 28, 29 i 30 de desembre, el 4 i 5 de gener i el 22, 23 i 24 de març.",
    "The first cycle of Infant education has its own calendar: in addition, 28, 29 and 30 December, 4 and 5 January and 22, 23 and 24 March are non-teaching days.",
  ],
  "Cada centro celebra un Día del Centro, que es lectivo.": [
    "Cada centre celebra un Dia del Centre, que és lectiu.",
    "Each school holds a School Day, which is a teaching day.",
  ],
  "Con aviso amarillo por calor los centros pueden reducir la jornada; con aviso naranja o rojo, la Secretaría General de Educación puede flexibilizar o suspender las clases.": [
    "Amb avís groc per calor els centres poden reduir la jornada; amb avís taronja o vermell, la Secretaria General d'Educació pot flexibilitzar o suspendre les classes.",
    "Under a yellow heat warning schools can shorten the day; under an orange or red warning, the General Secretariat for Education can relax or suspend classes.",
  ],

  // Galicia
  "Las dos fiestas laborales locales son días no lectivos. Si una o las dos no caen en día lectivo, el consejo escolar del centro puede pedir a la dirección territorial, antes del 16 de octubre de 2026, uno o dos días no lectivos que las sustituyan; la orden recomienda que los centros de una misma localidad elijan los mismos.": [
    "Les dues festes laborals locals són dies no lectius. Si una o totes dues no cauen en dia lectiu, el consell escolar del centre pot demanar a la direcció territorial, abans del 16 d'octubre de 2026, un o dos dies no lectius que les substitueixin; l'ordre recomana que els centres d'una mateixa localitat triïn els mateixos.",
    "The two local public holidays are non-teaching days. If one or both do not fall on a teaching day, the school's council can ask the territorial directorate, before 16 October 2026, for one or two non-teaching days to replace them; the order recommends that schools in the same town choose the same ones.",
  ],
  "En Infantil, la incorporación gradual del primer curso no puede alargarse más allá del 15 de septiembre de 2026.": [
    "A Infantil, la incorporació gradual del primer curs no es pot allargar més enllà del 15 de setembre de 2026.",
    "In Infant education, the phased start for the first year cannot go beyond 15 September 2026.",
  ],
  "Los comedores escolares de los centros públicos funcionan del 9 de septiembre de 2026 al 21 de junio de 2027.": [
    "Els menjadors escolars dels centres públics funcionen del 9 de setembre de 2026 al 21 de juny de 2027.",
    "School canteens in state schools run from 9 September 2026 to 21 June 2027.",
  ],
  "Los centros que tenían jornada matinal en junio y septiembre en 2025/26 la mantienen.": [
    "Els centres que tenien jornada de matí al juny i al setembre el 2025/26 la mantenen.",
    "Schools that had a mornings-only day in June and September in 2025/26 keep it.",
  ],

  // La Rioja
  "Cada localidad puede tener hasta siete días no lectivos propios: sus dos fiestas locales y otros cinco que se fijan por el procedimiento educativo municipal. El calendario de cada localidad está en la web de Ordenación Educativa del Gobierno de La Rioja.": [
    "Cada localitat pot tenir fins a set dies no lectius propis: les seves dues festes locals i cinc més que es fixen pel procediment educatiu municipal. El calendari de cada localitat és al web d'Ordenació Educativa del Govern de la Rioja.",
    "Each town can have up to seven non-teaching days of its own: its two local holidays and five more set through the municipal education procedure. Each town's calendar is on the La Rioja government's education planning website.",
  ],
  "El calendario general no se aplica a las escuelas infantiles ni a los centros privados de primer ciclo de Educación Infantil (0-3 años).": [
    "El calendari general no s'aplica a les escoles infantils ni als centres privats de primer cicle d'Educació Infantil (0-3 anys).",
    "The general calendar does not apply to nursery schools or to private first-cycle Infant education centres (ages 0-3).",
  ],

  // Madrid
  "No hay clase en las fiestas locales que fija cada municipio para 2026 y 2027, publicadas en el BOCM. Los centros privados concertados pueden cambiar uno de los días no lectivos de la orden para celebrar a su patrón, con acuerdo del consejo escolar y aviso a la Dirección de Área Territorial y a las familias.": [
    "No hi ha classe les festes locals que fixa cada municipi per al 2026 i el 2027, publicades al BOCM. Els centres privats concertats poden canviar un dels dies no lectius de l'ordre per celebrar el seu patró, amb l'acord del consell escolar i avís a la Direcció d'Àrea Territorial i a les famílies.",
    "There is no class on the local holidays each municipality sets for 2026 and 2027, published in the BOCM. State-funded private schools can swap one of the order's non-teaching days to celebrate their patron saint, with the school council's agreement and notice to the Area Directorate and to families.",
  ],
  "En los colegios públicos de Infantil, Primaria y Educación Especial las clases pueden ser solo de mañana, en jornada de cuatro horas, del 7 al 30 de septiembre de 2026 y del 1 al 18 de junio de 2027, y también el 22 de diciembre si lo acuerda el consejo escolar. El comedor sigue abierto.": [
    "A les escoles públiques d'Infantil, Primària i Educació Especial les classes poden ser només de matí, en jornada de quatre hores, del 7 al 30 de setembre de 2026 i de l'1 al 18 de juny de 2027, i també el 22 de desembre si ho acorda el consell escolar. El menjador continua obert.",
    "In state Infant, Primary and Special Education schools, classes can be mornings only, in a four-hour day, from 7 to 30 September 2026 and from 1 to 18 June 2027, and also on 22 December if the school council agrees. The canteen stays open.",
  ],
  "Las escuelas infantiles y unidades de 0 a 3 años solo tienen como no lectivos el 7 y el 8 de enero: para ellas el 12 y 15 de febrero y el 19 y 29 de marzo son lectivos.": [
    "Les escoles infantils i unitats de 0 a 3 anys només tenen com a no lectius el 7 i el 8 de gener: per a elles el 12 i 15 de febrer i el 19 i 29 de març són lectius.",
    "Nursery schools and units for ages 0 to 3 only have 7 and 8 January as non-teaching days: for them, 12 and 15 February and 19 and 29 March are teaching days.",
  ],

  // Melilla
  "En Melilla no hay días que elija cada centro: la resolución fija para todos los días de libre disposición (21 de septiembre, 2 de noviembre, 8 de enero y del 29 de marzo al 2 de abril). Solo puede cambiarse con autorización de la Dirección Provincial.": [
    "A Melilla no hi ha dies que triï cada centre: la resolució fixa per a tothom els dies de lliure disposició (21 de setembre, 2 de novembre, 8 de gener i del 29 de març al 2 d'abril). Només es pot canviar amb autorització de la Direcció Provincial.",
    "In Melilla there are no days chosen by each school: the resolution sets the discretionary days off for everyone (21 September, 2 November, 8 January and 29 March to 2 April). It can only be changed with the Provincial Directorate's authorisation.",
  ],
  "175 días lectivos. En junio y septiembre, Infantil y Primaria pueden tener jornada reducida de 9 a 13 horas.": [
    "175 dies lectius. Al juny i al setembre, Infantil i Primària poden fer jornada reduïda de 9 a 13 hores.",
    "175 teaching days. In June and September, Infant and Primary can have a shortened day from 9:00 to 13:00.",
  ],
  "El calendario gráfico da como fechas aproximadas de las fiestas musulmanas el 9 de marzo (fin del Ramadán) y el 17 de mayo (Fiesta del Sacrificio); el calendario laboral de 2027 publicado en el BOE fija el miércoles 10 de marzo y el lunes 17 de mayo.": [
    "El calendari gràfic dona com a dates aproximades de les festes musulmanes el 9 de març (final del Ramadà) i el 17 de maig (Festa del Sacrifici); el calendari laboral de 2027 publicat al BOE fixa el dimecres 10 de març i el dilluns 17 de maig.",
    "The calendar chart gives 9 March (end of Ramadan) and 17 May (Feast of the Sacrifice) as approximate dates for the Muslim holidays; the 2027 work calendar published in the BOE sets Wednesday 10 March and Monday 17 May.",
  ],
  "La resolución no está en un boletín: es un documento firmado el 10 de junio de 2026 y publicado en la página de la Dirección Provincial de Melilla.": [
    "La resolució no és en cap butlletí: és un document signat el 10 de juny de 2026 i publicat a la pàgina de la Direcció Provincial de Melilla.",
    "The resolution is not in an official bulletin: it is a document signed on 10 June 2026 and published on the Melilla Provincial Directorate's page.",
  ],

  // Murcia
  "Cada municipio tiene sus dos festivos locales (si caen en día sin clase, se trasladan a un día lectivo) y otros tres días no lectivos que propone el Consejo Escolar Municipal. Todos están en el anexo V de la resolución, municipio por municipio, y valen para todos los centros del municipio: están en la tabla de abajo.": [
    "Cada municipi té els seus dos festius locals (si cauen en dia sense classe, es traslladen a un dia lectiu) i tres dies no lectius més que proposa el Consell Escolar Municipal. Tots són a l'annex V de la resolució, municipi per municipi, i valen per a tots els centres del municipi: són a la taula de sota.",
    "Each municipality has its two local holidays (if they fall on a day without class, they are moved to a teaching day) and three more non-teaching days proposed by the Municipal School Council. They are all in annex V of the resolution, municipality by municipality, and apply to every school in the municipality: see the table below.",
  ],
  "Muchos municipios añaden como no lectivos días alrededor de la Semana Santa (del 30 de marzo al 2 de abril): mira el tuyo en la tabla.": [
    "Molts municipis afegeixen com a no lectius dies al voltant de la Setmana Santa (del 30 de març al 2 d'abril): mira el teu a la taula.",
    "Many municipalities add non-teaching days around Easter (30 March to 2 April): look up yours in the table.",
  ],
  "Una modificación de 12 de julio de 2026 (BORM núm. 167) cambió solo los días de Alguazas.": [
    "Una modificació de 12 de juliol de 2026 (BORM núm. 167) va canviar només els dies d'Alguazas.",
    "An amendment of 12 July 2026 (BORM no. 167) changed only the days for Alguazas.",
  ],

  // Navarre
  "No hay clase el día de la fiesta de la localidad (si cae en día sin clase, el centro puede elegir otra fecha). Además, cada centro puede fijar como máximo cinco días laborables no lectivos durante el curso, que no pueden servir para alargar Navidad ni Semana Santa. El consejo escolar aprueba el calendario y la inspección lo valida.": [
    "No hi ha classe el dia de la festa de la localitat (si cau en dia sense classe, el centre pot triar una altra data). A més, cada centre pot fixar com a màxim cinc dies feiners no lectius durant el curs, que no poden servir per allargar Nadal ni Setmana Santa. El consell escolar aprova el calendari i la inspecció el valida.",
    "There is no class on the town's holiday (if it falls on a day without class, the school can choose another date). In addition, each school can set at most five non-teaching working days during the year, which cannot be used to lengthen Christmas or Easter. The school council approves the calendar and the inspectorate validates it.",
  ],
  "Al menos 175 días lectivos en Infantil, Primaria, Educación Especial, ESO y 1.º de Bachillerato.": [
    "Almenys 175 dies lectius a Infantil, Primària, Educació Especial, ESO i 1r de Batxillerat.",
    "At least 175 teaching days in Infant, Primary, Special Education, ESO and first year of Bachillerato.",
  ],
  "La Formación Profesional tiene su propia resolución (225/2026, modificada por la 351/2026), con las mismas vacaciones de Navidad y Semana Santa.": [
    "La Formació Professional té la seva pròpia resolució (225/2026, modificada per la 351/2026), amb les mateixes vacances de Nadal i Setmana Santa.",
    "Vocational training (FP) has its own resolution (225/2026, amended by 351/2026), with the same Christmas and Easter holidays.",
  ],
  "En Navarra la resolución fija un margen y cada colegio aprueba su propio calendario: en Infantil y Primaria, el primer día está entre el 4 y el 8 de septiembre y el último entre el 18 y el 22 de junio.": [
    "A Navarra la resolució fixa un marge i cada escola aprova el seu propi calendari: a Infantil i Primària, el primer dia és entre el 4 i el 8 de setembre i l'últim entre el 18 i el 22 de juny.",
    "In Navarre the resolution sets a margin and each school approves its own calendar: in Infant and Primary, the first day is between 4 and 8 September and the last between 18 and 22 June.",
  ],

  // Basque Country
  "Son festivos los del calendario laboral de Euskadi y las fiestas patronales de la localidad y del territorio. Cada centro puede declarar festivo el día del patrón de una etapa (o cambiarlo por otro). El consejo escolar propone el calendario completo del centro y la Delegación Territorial de Educación lo aprueba.": [
    "Són festius els del calendari laboral d'Euskadi i les festes patronals de la localitat i del territori. Cada centre pot declarar festiu el dia del patró d'una etapa (o canviar-lo per un altre). El consell escolar proposa el calendari complet del centre i la Delegació Territorial d'Educació l'aprova.",
    "The days off are those in the Basque Country's work calendar and the patron saint festivities of the town and the province. Each school can declare the patron saint's day of a stage a holiday (or swap it for another day). The school council proposes the school's full calendar and the Territorial Education Delegation approves it.",
  ],
  "Al menos 175 días lectivos. Ninguna resolución del curso fija Carnavales ni otros días no lectivos: los decide cada centro.": [
    "Almenys 175 dies lectius. Cap resolució del curs fixa Carnaval ni altres dies no lectius: els decideix cada centre.",
    "At least 175 teaching days. No resolution for this school year sets Carnival or other non-teaching days: each school decides them.",
  ],
  "En Infantil y Primaria puede suprimirse la tarde en septiembre y junio y la del último día antes de Navidad, Semana Santa y Carnavales (dos tardes como máximo), con un máximo de cuatro horas por la mañana.": [
    "A Infantil i Primària es pot suprimir la tarda al setembre i al juny i la de l'últim dia abans de Nadal, Setmana Santa i Carnaval (dues tardes com a màxim), amb un màxim de quatre hores al matí.",
    "In Infant and Primary the afternoon session can be dropped in September and June and on the last day before Christmas, Easter and Carnival (two afternoons at most), with a maximum of four hours in the morning.",
  ],
  "ESO, Bachillerato y FP tienen su propia resolución, de la misma fecha, con las mismas vacaciones mínimas.": [
    "ESO, Batxillerat i FP tenen la seva pròpia resolució, de la mateixa data, amb les mateixes vacances mínimes.",
    "ESO, Bachillerato and vocational training (FP) have their own resolution, of the same date, with the same minimum holidays.",
  ],
  "En Euskadi el Departamento de Educación fija un marco y cada centro aprueba su propio calendario: inicio, fin, vacaciones (que puede alargar) y días festivos. Las fechas de abajo son los límites y mínimos para todos; las de tu centro están en su calendario.": [
    "A Euskadi el Departament d'Educació fixa un marc i cada centre aprova el seu propi calendari: inici, final, vacances (que pot allargar) i dies festius. Les dates de sota són els límits i mínims per a tothom; les del teu centre són al seu calendari.",
    "In the Basque Country the Department of Education sets a framework and each school approves its own calendar: start, end, holidays (which it can extend) and days off. The dates below are the limits and minimums for everyone; your school's are in its own calendar.",
  ],

  // Catalonia (its row in the hub; the page itself is the Catalonia guide)
  "Cada centro fija cuatro días de libre disposición, y no hay clase en las dos fiestas locales del municipio.": [
    "Cada centre fixa quatre dies de lliure disposició, i no hi ha classe les dues festes locals del municipi.",
    "Each school sets four discretionary days off, and there is no class on the municipality's two local holidays.",
  ],
};
