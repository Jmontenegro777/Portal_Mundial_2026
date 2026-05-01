import { PrismaClient, Confederation, PlayerPosition } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed del Portal Mundial 2026...");

  // ─── Admin User ───────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123456", 12);
  await prisma.user.upsert({
    where: { email: "admin@mundial2026.com" },
    update: {},
    create: {
      email: "admin@mundial2026.com",
      name: "Administrador FIFA",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Usuario admin creado: admin@mundial2026.com / admin123456");

  // ─── Grupos ───────────────────────────────────────────────────────────────
  const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const groups: Record<string, string> = {};

  for (const name of groupNames) {
    const group = await prisma.group.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    groups[name] = group.id;
  }
  console.log(`✅ ${groupNames.length} grupos creados`);

  // ─── Limpiar datos dependientes (orden FK) ────────────────────────────────
  await prisma.goal.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.stadium.deleteMany({});

  // ─── Estadios ─────────────────────────────────────────────────────────────
  const stadiumsData = [
    { name: "MetLife Stadium",           city: "East Rutherford, NJ", country: "USA",    capacity: 82500, latitude: 40.8135,  longitude: -74.0744  },
    { name: "AT&T Stadium",              city: "Arlington, TX",        country: "USA",    capacity: 80000, latitude: 32.7473,  longitude: -97.0945  },
    { name: "SoFi Stadium",              city: "Inglewood, CA",        country: "USA",    capacity: 70240, latitude: 33.9535,  longitude: -118.3392 },
    { name: "Levi's Stadium",            city: "Santa Clara, CA",      country: "USA",    capacity: 68500, latitude: 37.4032,  longitude: -121.9698 },
    { name: "Arrowhead Stadium",         city: "Kansas City, MO",      country: "USA",    capacity: 76416, latitude: 39.0489,  longitude: -94.4839  },
    { name: "Lincoln Financial Field",   city: "Philadelphia, PA",     country: "USA",    capacity: 69796, latitude: 39.9008,  longitude: -75.1675  },
    { name: "Gillette Stadium",          city: "Foxborough, MA",       country: "USA",    capacity: 65878, latitude: 42.0909,  longitude: -71.2643  },
    { name: "NRG Stadium",               city: "Houston, TX",          country: "USA",    capacity: 72220, latitude: 29.6847,  longitude: -95.4107  },
    { name: "Rose Bowl Stadium",         city: "Pasadena, CA",         country: "USA",    capacity: 92542, latitude: 34.1613,  longitude: -118.1676 },
    { name: "Lumen Field",               city: "Seattle, WA",          country: "USA",    capacity: 68740, latitude: 47.5952,  longitude: -122.3316 },
    { name: "BC Place",                  city: "Vancouver, BC",        country: "Canada", capacity: 54500, latitude: 49.2766,  longitude: -123.1116 },
    { name: "BMO Field",                 city: "Toronto, ON",          country: "Canada", capacity: 45736, latitude: 43.6332,  longitude: -79.4187  },
    { name: "Estadio Azteca",            city: "Ciudad de México",     country: "Mexico", capacity: 87523, latitude: 19.3028,  longitude: -99.1503  },
    { name: "Estadio Akron",             city: "Guadalajara",          country: "Mexico", capacity: 49850, latitude: 20.6762,  longitude: -103.3463 },
    { name: "Estadio BBVA",              city: "Monterrey",            country: "Mexico", capacity: 53500, latitude: 25.6697,  longitude: -100.2381 },
    { name: "Estadio Cuauhtémoc",        city: "Puebla",               country: "Mexico", capacity: 51832, latitude: 19.0406,  longitude: -98.2122  },
  ];

  await prisma.stadium.createMany({ data: stadiumsData });

  const createdStadiums = await prisma.stadium.findMany();
  const stadiums: Record<string, string> = {};
  for (const s of createdStadiums) stadiums[s.name] = s.id;
  console.log(`✅ ${stadiumsData.length} estadios creados`);

  // ─── Equipos — 48 clasificados Copa del Mundo 2026 ────────────────────────
  // Fuente: Álbum Panini Mundial 2026
  const teamsData = [
    // Grupo A: MEX, RSA, KOR, CZE
    { name: "México",            code: "MEX", confederation: Confederation.CONCACAF, coach: "Javier Aguirre",      groupId: groups["A"] },
    { name: "Sudáfrica",         code: "RSA", confederation: Confederation.CAF,      coach: "Hugo Broos",           groupId: groups["A"] },
    { name: "Corea del Sur",     code: "KOR", confederation: Confederation.AFC,      coach: "Hong Myung-bo",        groupId: groups["A"] },
    { name: "República Checa",   code: "CZE", confederation: Confederation.UEFA,     coach: "Ivan Hašek",           groupId: groups["A"] },
    // Grupo B: CAN, BIH, QAT, SUI
    { name: "Canadá",            code: "CAN", confederation: Confederation.CONCACAF, coach: "Jesse Marsch",         groupId: groups["B"] },
    { name: "Bosnia-Herzegovina",code: "BIH", confederation: Confederation.UEFA,     coach: "Sergej Barbarez",      groupId: groups["B"] },
    { name: "Qatar",             code: "QAT", confederation: Confederation.AFC,      coach: "Marquez López",        groupId: groups["B"] },
    { name: "Suiza",             code: "SUI", confederation: Confederation.UEFA,     coach: "Murat Yakin",          groupId: groups["B"] },
    // Grupo C: BRA, MAR, HAI, SCO
    { name: "Brasil",            code: "BRA", confederation: Confederation.CONMEBOL, coach: "Dorival Júnior",       groupId: groups["C"] },
    { name: "Marruecos",         code: "MAR", confederation: Confederation.CAF,      coach: "Walid Regragui",       groupId: groups["C"] },
    { name: "Haití",             code: "HAI", confederation: Confederation.CONCACAF, coach: "Marc Collat",          groupId: groups["C"] },
    { name: "Escocia",           code: "SCO", confederation: Confederation.UEFA,     coach: "Steve Clarke",         groupId: groups["C"] },
    // Grupo D: USA, PAR, AUS, TUR
    { name: "Estados Unidos",    code: "USA", confederation: Confederation.CONCACAF, coach: "Mauricio Pochettino",  groupId: groups["D"] },
    { name: "Paraguay",          code: "PAR", confederation: Confederation.CONMEBOL, coach: "Gustavo Alfaro",       groupId: groups["D"] },
    { name: "Australia",         code: "AUS", confederation: Confederation.AFC,      coach: "Tony Popovic",         groupId: groups["D"] },
    { name: "Turquía",           code: "TUR", confederation: Confederation.UEFA,     coach: "Vincenzo Montella",    groupId: groups["D"] },
    // Grupo E: GER, CUR, CIV, ECU
    { name: "Alemania",          code: "GER", confederation: Confederation.UEFA,     coach: "Julian Nagelsmann",    groupId: groups["E"] },
    { name: "Curazao",           code: "CUR", confederation: Confederation.CONCACAF, coach: "Remko Bicentini",      groupId: groups["E"] },
    { name: "Costa de Marfil",   code: "CIV", confederation: Confederation.CAF,      coach: "Emerse Faé",           groupId: groups["E"] },
    { name: "Ecuador",           code: "ECU", confederation: Confederation.CONMEBOL, coach: "Sébastien Beccacece", groupId: groups["E"] },
    // Grupo F: NED, JPN, SWE, TUN
    { name: "Países Bajos",      code: "NED", confederation: Confederation.UEFA,     coach: "Ronald Koeman",        groupId: groups["F"] },
    { name: "Japón",             code: "JPN", confederation: Confederation.AFC,      coach: "Hajime Moriyasu",      groupId: groups["F"] },
    { name: "Suecia",            code: "SWE", confederation: Confederation.UEFA,     coach: "Jon Dahl Tomasson",    groupId: groups["F"] },
    { name: "Túnez",             code: "TUN", confederation: Confederation.CAF,      coach: "Jalel Kadri",          groupId: groups["F"] },
    // Grupo G: BEL, EGY, IRN, NZL
    { name: "Bélgica",           code: "BEL", confederation: Confederation.UEFA,     coach: "Rudi García",          groupId: groups["G"] },
    { name: "Egipto",            code: "EGY", confederation: Confederation.CAF,      coach: "Hossam Hassan",        groupId: groups["G"] },
    { name: "Irán",              code: "IRN", confederation: Confederation.AFC,      coach: "Amir Ghalenoei",       groupId: groups["G"] },
    { name: "Nueva Zelanda",     code: "NZL", confederation: Confederation.OFC,      coach: "Darren Bazeley",       groupId: groups["G"] },
    // Grupo H: ESP, CPV, KSA, URU
    { name: "España",            code: "ESP", confederation: Confederation.UEFA,     coach: "Luis de la Fuente",    groupId: groups["H"] },
    { name: "Cabo Verde",        code: "CPV", confederation: Confederation.CAF,      coach: "Bubista",              groupId: groups["H"] },
    { name: "Arabia Saudita",    code: "KSA", confederation: Confederation.AFC,      coach: "Herve Renard",         groupId: groups["H"] },
    { name: "Uruguay",           code: "URU", confederation: Confederation.CONMEBOL, coach: "Marcelo Bielsa",       groupId: groups["H"] },
    // Grupo I: FRA, SEN, IRQ, NOR
    { name: "Francia",           code: "FRA", confederation: Confederation.UEFA,     coach: "Didier Deschamps",     groupId: groups["I"] },
    { name: "Senegal",           code: "SEN", confederation: Confederation.CAF,      coach: "Aliou Cissé",          groupId: groups["I"] },
    { name: "Irak",              code: "IRQ", confederation: Confederation.AFC,      coach: "Jesús Casas",          groupId: groups["I"] },
    { name: "Noruega",           code: "NOR", confederation: Confederation.UEFA,     coach: "Ståle Solbakken",      groupId: groups["I"] },
    // Grupo J: ARG, ALG, AUT, JOR
    { name: "Argentina",         code: "ARG", confederation: Confederation.CONMEBOL, coach: "Lionel Scaloni",       groupId: groups["J"] },
    { name: "Argelia",           code: "ALG", confederation: Confederation.CAF,      coach: "Vladimir Petkovic",    groupId: groups["J"] },
    { name: "Austria",           code: "AUT", confederation: Confederation.UEFA,     coach: "Ralf Rangnick",        groupId: groups["J"] },
    { name: "Jordania",          code: "JOR", confederation: Confederation.AFC,      coach: "Hussein Ammouta",      groupId: groups["J"] },
    // Grupo K: POR, COD, UZB, COL
    { name: "Portugal",          code: "POR", confederation: Confederation.UEFA,     coach: "Roberto Martínez",     groupId: groups["K"] },
    { name: "Congo DR",          code: "COD", confederation: Confederation.CAF,      coach: "Sébastien Desabre",    groupId: groups["K"] },
    { name: "Uzbekistán",        code: "UZB", confederation: Confederation.AFC,      coach: "Srecko Katanec",       groupId: groups["K"] },
    { name: "Colombia",          code: "COL", confederation: Confederation.CONMEBOL, coach: "Néstor Lorenzo",       groupId: groups["K"] },
    // Grupo L: ENG, CRO, GHA, PAN
    { name: "Inglaterra",        code: "ENG", confederation: Confederation.UEFA,     coach: "Thomas Tuchel",        groupId: groups["L"] },
    { name: "Croacia",           code: "CRO", confederation: Confederation.UEFA,     coach: "Zlatko Dalić",         groupId: groups["L"] },
    { name: "Ghana",             code: "GHA", confederation: Confederation.CAF,      coach: "Otto Addo",            groupId: groups["L"] },
    { name: "Panamá",            code: "PAN", confederation: Confederation.CONCACAF, coach: "Thomas Christiansen",  groupId: groups["L"] },
  ];

  const teamMap: Record<string, string> = {};
  for (const t of teamsData) {
    const team = await prisma.team.upsert({
      where: { code: t.code },
      update: { groupId: t.groupId, coach: t.coach },
      create: t,
    });
    teamMap[t.code] = team.id;
  }
  console.log(`✅ ${teamsData.length} equipos creados`);

  // ─── Jugadores (muestra representativa) ──────────────────────────────────
  const playersData = [
    // Argentina (Grupo J)
    { firstName: "Emiliano",  lastName: "Martínez",         number: 23, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1992-09-02"), nationality: "Argentina",   teamCode: "ARG" },
    { firstName: "Nicolás",   lastName: "Otamendi",         number: 19, position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1988-02-12"), nationality: "Argentina",   teamCode: "ARG" },
    { firstName: "Rodrigo",   lastName: "De Paul",          number: 7,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1994-05-24"), nationality: "Argentina",   teamCode: "ARG" },
    { firstName: "Lionel",    lastName: "Messi",            number: 10, position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1987-06-24"), nationality: "Argentina",   teamCode: "ARG" },
    { firstName: "Julián",    lastName: "Álvarez",          number: 9,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("2000-01-31"), nationality: "Argentina",   teamCode: "ARG" },
    // Brasil (Grupo C)
    { firstName: "Alisson",   lastName: "Becker",           number: 1,  position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1992-10-02"), nationality: "Brasil",      teamCode: "BRA" },
    { firstName: "Marquinhos",lastName: "Aoas Corrêa",      number: 4,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1994-05-14"), nationality: "Brasil",      teamCode: "BRA" },
    { firstName: "Casemiro",  lastName: "Nascimento",       number: 5,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1992-02-23"), nationality: "Brasil",      teamCode: "BRA" },
    { firstName: "Vinícius",  lastName: "Júnior",           number: 7,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("2000-07-12"), nationality: "Brasil",      teamCode: "BRA" },
    { firstName: "Rodrygo",   lastName: "Goes",             number: 11, position: PlayerPosition.FORWARD,    dateOfBirth: new Date("2001-01-09"), nationality: "Brasil",      teamCode: "BRA" },
    // Francia (Grupo I)
    { firstName: "Mike",      lastName: "Maignan",          number: 16, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1995-07-03"), nationality: "Francia",     teamCode: "FRA" },
    { firstName: "Raphaël",   lastName: "Varane",           number: 4,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1993-04-25"), nationality: "Francia",     teamCode: "FRA" },
    { firstName: "Aurélien",  lastName: "Tchouaméni",       number: 8,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2000-01-27"), nationality: "Francia",     teamCode: "FRA" },
    { firstName: "Kylian",    lastName: "Mbappé",           number: 10, position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1998-12-20"), nationality: "Francia",     teamCode: "FRA" },
    { firstName: "Olivier",   lastName: "Giroud",           number: 9,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1986-09-30"), nationality: "Francia",     teamCode: "FRA" },
    // España (Grupo H)
    { firstName: "Unai",      lastName: "Simón",            number: 1,  position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1997-06-11"), nationality: "España",      teamCode: "ESP" },
    { firstName: "Dani",      lastName: "Carvajal",         number: 2,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1992-01-11"), nationality: "España",      teamCode: "ESP" },
    { firstName: "Pedri",     lastName: "González",         number: 8,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2002-11-25"), nationality: "España",      teamCode: "ESP" },
    { firstName: "Lamine",    lastName: "Yamal",            number: 19, position: PlayerPosition.FORWARD,    dateOfBirth: new Date("2007-07-13"), nationality: "España",      teamCode: "ESP" },
    { firstName: "Álvaro",    lastName: "Morata",           number: 9,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1992-10-23"), nationality: "España",      teamCode: "ESP" },
    // Alemania (Grupo E)
    { firstName: "Manuel",    lastName: "Neuer",            number: 1,  position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1986-03-27"), nationality: "Alemania",    teamCode: "GER" },
    { firstName: "Antonio",   lastName: "Rüdiger",          number: 2,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1993-03-03"), nationality: "Alemania",    teamCode: "GER" },
    { firstName: "Joshua",    lastName: "Kimmich",          number: 6,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1995-02-08"), nationality: "Alemania",    teamCode: "GER" },
    { firstName: "Florian",   lastName: "Wirtz",            number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2003-05-03"), nationality: "Alemania",    teamCode: "GER" },
    { firstName: "Niclas",    lastName: "Füllkrug",         number: 9,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1993-02-09"), nationality: "Alemania",    teamCode: "GER" },
    // Inglaterra (Grupo L)
    { firstName: "Jordan",    lastName: "Pickford",         number: 1,  position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1994-03-07"), nationality: "Inglaterra",  teamCode: "ENG" },
    { firstName: "Trent",     lastName: "Alexander-Arnold", number: 2,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1998-10-07"), nationality: "Inglaterra",  teamCode: "ENG" },
    { firstName: "Declan",    lastName: "Rice",             number: 4,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1999-01-14"), nationality: "Inglaterra",  teamCode: "ENG" },
    { firstName: "Jude",      lastName: "Bellingham",       number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2003-06-29"), nationality: "Inglaterra",  teamCode: "ENG" },
    { firstName: "Harry",     lastName: "Kane",             number: 9,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1993-07-28"), nationality: "Inglaterra",  teamCode: "ENG" },
    // Portugal (Grupo K)
    { firstName: "Rui",       lastName: "Patrício",         number: 1,  position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1988-02-15"), nationality: "Portugal",    teamCode: "POR" },
    { firstName: "Rúben",     lastName: "Dias",             number: 3,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1997-05-14"), nationality: "Portugal",    teamCode: "POR" },
    { firstName: "Bruno",     lastName: "Fernandes",        number: 8,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1994-09-08"), nationality: "Portugal",    teamCode: "POR" },
    { firstName: "Cristiano", lastName: "Ronaldo",          number: 7,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1985-02-05"), nationality: "Portugal",    teamCode: "POR" },
    { firstName: "Rafael",    lastName: "Leão",             number: 11, position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1999-06-10"), nationality: "Portugal",    teamCode: "POR" },
    // Colombia (Grupo K)
    { firstName: "Camilo",    lastName: "Vargas",           number: 1,  position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1992-01-08"), nationality: "Colombia",    teamCode: "COL" },
    { firstName: "Dávinson",  lastName: "Sánchez",          number: 6,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("1996-06-12"), nationality: "Colombia",    teamCode: "COL" },
    { firstName: "Matheus",   lastName: "Uribe",            number: 13, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1991-03-11"), nationality: "Colombia",    teamCode: "COL" },
    { firstName: "James",     lastName: "Rodríguez",        number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1991-07-12"), nationality: "Colombia",    teamCode: "COL" },
    { firstName: "Luis",      lastName: "Díaz",             number: 7,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("1997-01-13"), nationality: "Colombia",    teamCode: "COL" },
    // Estados Unidos (Grupo D)
    { firstName: "Matt",      lastName: "Turner",           number: 1,  position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1994-06-24"), nationality: "USA",         teamCode: "USA" },
    { firstName: "Sergiño",   lastName: "Dest",             number: 2,  position: PlayerPosition.DEFENDER,   dateOfBirth: new Date("2000-11-03"), nationality: "USA",         teamCode: "USA" },
    { firstName: "Tyler",     lastName: "Adams",            number: 4,  position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1999-02-14"), nationality: "USA",         teamCode: "USA" },
    { firstName: "Christian", lastName: "Pulisic",          number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1998-09-18"), nationality: "USA",         teamCode: "USA" },
    { firstName: "Ricardo",   lastName: "Pepi",             number: 9,  position: PlayerPosition.FORWARD,    dateOfBirth: new Date("2003-01-09"), nationality: "USA",         teamCode: "USA" },
  ];

  for (const p of playersData) {
    const teamId = teamMap[p.teamCode];
    if (!teamId) continue;
    try {
      await prisma.player.upsert({
        where: { teamId_number: { teamId, number: p.number } },
        update: {},
        create: {
          firstName: p.firstName,
          lastName: p.lastName,
          number: p.number,
          position: p.position,
          dateOfBirth: p.dateOfBirth,
          nationality: p.nationality,
          teamId,
        },
      });
    } catch {
      // skip duplicate
    }
  }
  console.log(`✅ ${playersData.length} jugadores creados`);

  // ─── Referencias de estadios ──────────────────────────────────────────────
  const aztecaId    = stadiums["Estadio Azteca"];
  const metlifeId   = stadiums["MetLife Stadium"];
  const attId       = stadiums["AT&T Stadium"];
  const sofiId      = stadiums["SoFi Stadium"];
  const akronId     = stadiums["Estadio Akron"];
  const bbvaId      = stadiums["Estadio BBVA"];
  const levisId     = stadiums["Levi's Stadium"];
  const roseBowlId  = stadiums["Rose Bowl Stadium"];

  // ─── Partidos ─────────────────────────────────────────────────────────────
  const matchesData = [
    // ── Grupo A: MEX, RSA, KOR, CZE ──
    { matchNumber: 1,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-11T21:00:00Z"), homeCode: "MEX", awayCode: "KOR", homeScore: 2, awayScore: 1, stadiumId: aztecaId,   groupId: groups["A"], attendance: 85000 },
    { matchNumber: 2,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-12T00:00:00Z"), homeCode: "RSA", awayCode: "CZE", homeScore: 0, awayScore: 1, stadiumId: metlifeId,  groupId: groups["A"], attendance: 62000 },
    { matchNumber: 3,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-15T21:00:00Z"), homeCode: "MEX", awayCode: "CZE", homeScore: 3, awayScore: 0, stadiumId: aztecaId,   groupId: groups["A"], attendance: 87523 },
    { matchNumber: 4,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-16T00:00:00Z"), homeCode: "KOR", awayCode: "RSA", homeScore: 2, awayScore: 0, stadiumId: metlifeId,  groupId: groups["A"], attendance: 70000 },
    { matchNumber: 5,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-19T21:00:00Z"), homeCode: "MEX", awayCode: "RSA", homeScore: 2, awayScore: 0, stadiumId: aztecaId,   groupId: groups["A"], attendance: 87523 },
    { matchNumber: 6,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-19T21:00:00Z"), homeCode: "CZE", awayCode: "KOR", homeScore: 1, awayScore: 1, stadiumId: attId,      groupId: groups["A"], attendance: 65000 },
    // ── Grupo B: CAN, BIH, QAT, SUI ──
    { matchNumber: 7,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-12T18:00:00Z"), homeCode: "CAN", awayCode: "QAT", homeScore: 3, awayScore: 0, stadiumId: sofiId,     groupId: groups["B"], attendance: 65000 },
    { matchNumber: 8,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-12T21:00:00Z"), homeCode: "BIH", awayCode: "SUI", homeScore: 1, awayScore: 2, stadiumId: akronId,    groupId: groups["B"], attendance: 45000 },
    { matchNumber: 9,  stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-16T18:00:00Z"), homeCode: "CAN", awayCode: "SUI", homeScore: 1, awayScore: 1, stadiumId: sofiId,     groupId: groups["B"], attendance: 68000 },
    { matchNumber: 10, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-16T21:00:00Z"), homeCode: "QAT", awayCode: "BIH", homeScore: 0, awayScore: 2, stadiumId: akronId,    groupId: groups["B"], attendance: 43000 },
    { matchNumber: 11, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-20T21:00:00Z"), homeCode: "CAN", awayCode: "BIH", homeScore: 2, awayScore: 0, stadiumId: sofiId,     groupId: groups["B"], attendance: 67000 },
    { matchNumber: 12, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-20T21:00:00Z"), homeCode: "SUI", awayCode: "QAT", homeScore: 2, awayScore: 0, stadiumId: levisId,    groupId: groups["B"], attendance: 60000 },
    // ── Grupo C: BRA, MAR, HAI, SCO ──
    { matchNumber: 13, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-13T18:00:00Z"), homeCode: "BRA", awayCode: "HAI", homeScore: 4, awayScore: 0, stadiumId: metlifeId,  groupId: groups["C"], attendance: 82000 },
    { matchNumber: 14, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-13T21:00:00Z"), homeCode: "MAR", awayCode: "SCO", homeScore: 2, awayScore: 0, stadiumId: attId,      groupId: groups["C"], attendance: 72000 },
    { matchNumber: 15, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-17T18:00:00Z"), homeCode: "BRA", awayCode: "SCO", homeScore: 2, awayScore: 1, stadiumId: metlifeId,  groupId: groups["C"], attendance: 80000 },
    { matchNumber: 16, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-17T21:00:00Z"), homeCode: "MAR", awayCode: "HAI", homeScore: 3, awayScore: 0, stadiumId: attId,      groupId: groups["C"], attendance: 70000 },
    { matchNumber: 17, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-21T21:00:00Z"), homeCode: "BRA", awayCode: "MAR", homeScore: 2, awayScore: 0, stadiumId: roseBowlId, groupId: groups["C"], attendance: 92000 },
    { matchNumber: 18, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-21T21:00:00Z"), homeCode: "SCO", awayCode: "HAI", homeScore: 2, awayScore: 1, stadiumId: bbvaId,     groupId: groups["C"], attendance: 48000 },
    // ── Grupo D: USA, PAR, AUS, TUR ──
    { matchNumber: 19, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-14T18:00:00Z"), homeCode: "USA", awayCode: "PAR", homeScore: 2, awayScore: 1, stadiumId: levisId,    groupId: groups["D"], attendance: 65000 },
    { matchNumber: 20, stage: "GROUP", status: "FINISHED",  scheduledAt: new Date("2026-06-14T21:00:00Z"), homeCode: "AUS", awayCode: "TUR", homeScore: 1, awayScore: 0, stadiumId: bbvaId,     groupId: groups["D"], attendance: 50000 },
    { matchNumber: 21, stage: "GROUP", status: "SCHEDULED", scheduledAt: new Date("2026-06-18T18:00:00Z"), homeCode: "USA", awayCode: "TUR", homeScore: null, awayScore: null, stadiumId: levisId, groupId: groups["D"], attendance: null },
    { matchNumber: 22, stage: "GROUP", status: "SCHEDULED", scheduledAt: new Date("2026-06-18T21:00:00Z"), homeCode: "PAR", awayCode: "AUS", homeScore: null, awayScore: null, stadiumId: bbvaId,  groupId: groups["D"], attendance: null },
    // ── Octavos de final (ejemplo) ──
    { matchNumber: 65, stage: "ROUND_OF_16", status: "SCHEDULED", scheduledAt: new Date("2026-06-29T21:00:00Z"), homeCode: "ARG", awayCode: "USA", homeScore: null, awayScore: null, stadiumId: metlifeId,  groupId: null, attendance: null },
    { matchNumber: 66, stage: "ROUND_OF_16", status: "SCHEDULED", scheduledAt: new Date("2026-06-30T21:00:00Z"), homeCode: "BRA", awayCode: "GER", homeScore: null, awayScore: null, stadiumId: roseBowlId, groupId: null, attendance: null },
  ];

  const createdMatches: Record<number, string> = {};
  for (const m of matchesData) {
    const homeTeamId = m.homeCode ? teamMap[m.homeCode] : null;
    const awayTeamId = m.awayCode ? teamMap[m.awayCode] : null;
    if (!m.stadiumId) continue;
    const match = await prisma.match.create({
      data: {
        matchNumber: m.matchNumber,
        stage:       m.stage as never,
        status:      m.status as never,
        scheduledAt: m.scheduledAt,
        homeTeamId:  homeTeamId || null,
        awayTeamId:  awayTeamId || null,
        homeScore:   m.homeScore ?? null,
        awayScore:   m.awayScore ?? null,
        stadiumId:   m.stadiumId,
        groupId:     m.groupId || null,
        attendance:  m.attendance ?? null,
      },
    });
    createdMatches[m.matchNumber] = match.id;
  }
  console.log(`✅ ${matchesData.length} partidos creados`);

  // ─── Helper para buscar jugador por equipo + apellido ─────────────────────
  const getPlayer = async (teamCode: string, lastName: string) => {
    const teamId = teamMap[teamCode];
    if (!teamId) return null;
    return prisma.player.findFirst({ where: { teamId, lastName: { contains: lastName } } });
  };

  // ─── Goles representativos ────────────────────────────────────────────────
  const goalsData = [
    // Match 13: BRA 4-0 HAI
    { matchNum: 13, teamCode: "BRA", lastName: "Júnior",    minute: 12, isPenalty: false },
    { matchNum: 13, teamCode: "BRA", lastName: "Goes",      minute: 34, isPenalty: false },
    { matchNum: 13, teamCode: "BRA", lastName: "Júnior",    minute: 71, isPenalty: false },
    { matchNum: 13, teamCode: "BRA", lastName: "Goes",      minute: 88, isPenalty: false },
    // Match 15: BRA 2-1 SCO
    { matchNum: 15, teamCode: "BRA", lastName: "Júnior",    minute: 15, isPenalty: false },
    { matchNum: 15, teamCode: "BRA", lastName: "Goes",      minute: 50, isPenalty: false },
    // Match 17: BRA 2-0 MAR
    { matchNum: 17, teamCode: "BRA", lastName: "Júnior",    minute: 35, isPenalty: false },
    { matchNum: 17, teamCode: "BRA", lastName: "Goes",      minute: 72, isPenalty: false },
    // Match 19: USA 2-1 PAR
    { matchNum: 19, teamCode: "USA", lastName: "Pulisic",   minute: 22, isPenalty: false },
    { matchNum: 19, teamCode: "USA", lastName: "Pepi",      minute: 68, isPenalty: false },
    // Match 5: MEX 2-0 RSA — sin jugadores sembrados; se omitirá silenciosamente
    // Match 8: ESP vs JPN → ahora BIH vs SUI — sin jugadores sembrados
  ];

  let goalsCreated = 0;
  for (const g of goalsData) {
    const matchId = createdMatches[g.matchNum];
    if (!matchId) continue;
    const player = await getPlayer(g.teamCode, g.lastName);
    if (!player) continue;
    await prisma.goal.create({
      data: { matchId, playerId: player.id, minute: g.minute, isPenalty: g.isPenalty, isOwnGoal: false },
    });
    goalsCreated++;
  }
  console.log(`✅ ${goalsCreated} goles registrados`);

  // ─── Tarjetas representativas ─────────────────────────────────────────────
  const cardsData = [
    { matchNum: 13, teamCode: "BRA", lastName: "Casemiro",   minute: 38, type: "YELLOW" },
    { matchNum: 15, teamCode: "BRA", lastName: "Marquinhos", minute: 55, type: "YELLOW" },
    { matchNum: 17, teamCode: "BRA", lastName: "Casemiro",   minute: 74, type: "YELLOW" },
    { matchNum: 19, teamCode: "USA", lastName: "Adams",      minute: 45, type: "YELLOW" },
    { matchNum: 19, teamCode: "USA", lastName: "Dest",       minute: 72, type: "YELLOW" },
  ];

  let cardsCreated = 0;
  for (const c of cardsData) {
    const matchId = createdMatches[c.matchNum];
    if (!matchId) continue;
    const player = await getPlayer(c.teamCode, c.lastName);
    if (!player) continue;
    await prisma.card.create({
      data: { matchId, playerId: player.id, minute: c.minute, type: c.type as never },
    });
    cardsCreated++;
  }
  console.log(`✅ ${cardsCreated} tarjetas registradas`);

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email:     admin@mundial2026.com");
  console.log("🔑 Password:  admin123456");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
