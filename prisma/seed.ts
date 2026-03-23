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

  // ─── Estadios ─────────────────────────────────────────────────────────────
  const stadiumsData = [
    { name: "MetLife Stadium", city: "East Rutherford, NJ", country: "USA", capacity: 82500, latitude: 40.8135, longitude: -74.0744 },
    { name: "AT&T Stadium", city: "Arlington, TX", country: "USA", capacity: 80000, latitude: 32.7473, longitude: -97.0945 },
    { name: "SoFi Stadium", city: "Inglewood, CA", country: "USA", capacity: 70240, latitude: 33.9535, longitude: -118.3392 },
    { name: "Levi's Stadium", city: "Santa Clara, CA", country: "USA", capacity: 68500, latitude: 37.4032, longitude: -121.9698 },
    { name: "Arrowhead Stadium", city: "Kansas City, MO", country: "USA", capacity: 76416, latitude: 39.0489, longitude: -94.4839 },
    { name: "Lincoln Financial Field", city: "Philadelphia, PA", country: "USA", capacity: 69796, latitude: 39.9008, longitude: -75.1675 },
    { name: "Gillette Stadium", city: "Foxborough, MA", country: "USA", capacity: 65878, latitude: 42.0909, longitude: -71.2643 },
    { name: "NRG Stadium", city: "Houston, TX", country: "USA", capacity: 72220, latitude: 29.6847, longitude: -95.4107 },
    { name: "Rose Bowl Stadium", city: "Pasadena, CA", country: "USA", capacity: 92542, latitude: 34.1613, longitude: -118.1676 },
    { name: "Seattle/Tacoma — Lumen Field", city: "Seattle, WA", country: "USA", capacity: 68740, latitude: 47.5952, longitude: -122.3316 },
    // Canada
    { name: "BC Place", city: "Vancouver, BC", country: "Canada", capacity: 54500, latitude: 49.2766, longitude: -123.1116 },
    { name: "BMO Field", city: "Toronto, ON", country: "Canada", capacity: 45736, latitude: 43.6332, longitude: -79.4187 },
    // Mexico
    { name: "Estadio Azteca", city: "Ciudad de México", country: "Mexico", capacity: 87523, latitude: 19.3028, longitude: -99.1503 },
    { name: "Estadio Akron", city: "Guadalajara", country: "Mexico", capacity: 49850, latitude: 20.6762, longitude: -103.3463 },
    { name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: 53500, latitude: 25.6697, longitude: -100.2381 },
    { name: "Estadio Cuauhtémoc", city: "Puebla", country: "Mexico", capacity: 51832, latitude: 19.0406, longitude: -98.2122 },
  ];

  // Delete existing and recreate for idempotency
  await prisma.stadium.deleteMany({});
  await prisma.stadium.createMany({ data: stadiumsData });

  const createdStadiums = await prisma.stadium.findMany();
  const stadiums: Record<string, string> = {};
  for (const s of createdStadiums) {
    stadiums[s.name] = s.id;
  }
  console.log(`✅ ${stadiumsData.length} estadios creados`);

  // ─── Equipos ──────────────────────────────────────────────────────────────
  const teamsData = [
    // Grupo A
    { name: "Estados Unidos", code: "USA", confederation: Confederation.CONCACAF, coach: "Mauricio Pochettino", groupId: groups["A"] },
    { name: "México", code: "MEX", confederation: Confederation.CONCACAF, coach: "Javier Aguirre", groupId: groups["A"] },
    { name: "Uruguay", code: "URU", confederation: Confederation.CONMEBOL, coach: "Marcelo Bielsa", groupId: groups["A"] },
    { name: "Senegal", code: "SEN", confederation: Confederation.CAF, coach: "Aliou Cissé", groupId: groups["A"] },
    // Grupo B
    { name: "Brasil", code: "BRA", confederation: Confederation.CONMEBOL, coach: "Dorival Júnior", groupId: groups["B"] },
    { name: "España", code: "ESP", confederation: Confederation.UEFA, coach: "Luis de la Fuente", groupId: groups["B"] },
    { name: "Japón", code: "JPN", confederation: Confederation.AFC, coach: "Hajime Moriyasu", groupId: groups["B"] },
    { name: "Costa Rica", code: "CRC", confederation: Confederation.CONCACAF, coach: "Gustavo Alfaro", groupId: groups["B"] },
    // Grupo C
    { name: "Argentina", code: "ARG", confederation: Confederation.CONMEBOL, coach: "Lionel Scaloni", groupId: groups["C"] },
    { name: "Francia", code: "FRA", confederation: Confederation.UEFA, coach: "Didier Deschamps", groupId: groups["C"] },
    { name: "Australia", code: "AUS", confederation: Confederation.AFC, coach: "Tony Popovic", groupId: groups["C"] },
    { name: "Nigeria", code: "NGA", confederation: Confederation.CAF, coach: "Eric Chelle", groupId: groups["C"] },
    // Grupo D
    { name: "Alemania", code: "GER", confederation: Confederation.UEFA, coach: "Julian Nagelsmann", groupId: groups["D"] },
    { name: "Portugal", code: "POR", confederation: Confederation.UEFA, coach: "Roberto Martínez", groupId: groups["D"] },
    { name: "Colombia", code: "COL", confederation: Confederation.CONMEBOL, coach: "Néstor Lorenzo", groupId: groups["D"] },
    { name: "Marruecos", code: "MAR", confederation: Confederation.CAF, coach: "Walid Regragui", groupId: groups["D"] },
    // Grupo E
    { name: "Inglaterra", code: "ENG", confederation: Confederation.UEFA, coach: "Thomas Tuchel", groupId: groups["E"] },
    { name: "Países Bajos", code: "NED", confederation: Confederation.UEFA, coach: "Ronald Koeman", groupId: groups["E"] },
    { name: "Ecuador", code: "ECU", confederation: Confederation.CONMEBOL, coach: "Sébastien Beccacece", groupId: groups["E"] },
    { name: "Irán", code: "IRN", confederation: Confederation.AFC, coach: "Amir Ghalenoei", groupId: groups["E"] },
    // Grupo F
    { name: "Bélgica", code: "BEL", confederation: Confederation.UEFA, coach: "Rudi García", groupId: groups["F"] },
    { name: "Italia", code: "ITA", confederation: Confederation.UEFA, coach: "Luciano Spalletti", groupId: groups["F"] },
    { name: "Chile", code: "CHI", confederation: Confederation.CONMEBOL, coach: "Ricardo Gareca", groupId: groups["F"] },
    { name: "Arabia Saudita", code: "KSA", confederation: Confederation.AFC, coach: "Herve Renard", groupId: groups["F"] },
    // Grupo G
    { name: "Croacia", code: "CRO", confederation: Confederation.UEFA, coach: "Zlatko Dalić", groupId: groups["G"] },
    { name: "Suiza", code: "SUI", confederation: Confederation.UEFA, coach: "Murat Yakin", groupId: groups["G"] },
    { name: "Venezuela", code: "VEN", confederation: Confederation.CONMEBOL, coach: "Fernando Batista", groupId: groups["G"] },
    { name: "Egipto", code: "EGY", confederation: Confederation.CAF, coach: "Hossam Hassan", groupId: groups["G"] },
    // Grupo H
    { name: "Corea del Sur", code: "KOR", confederation: Confederation.AFC, coach: "Hong Myung-bo", groupId: groups["H"] },
    { name: "Dinamarca", code: "DEN", confederation: Confederation.UEFA, coach: "Brian Riemer", groupId: groups["H"] },
    { name: "Serbia", code: "SRB", confederation: Confederation.UEFA, coach: "Dragan Stojković", groupId: groups["H"] },
    { name: "Panamá", code: "PAN", confederation: Confederation.CONCACAF, coach: "Thomas Christiansen", groupId: groups["H"] },
    // Grupo I
    { name: "Polonia", code: "POL", confederation: Confederation.UEFA, coach: "Michał Probierz", groupId: groups["I"] },
    { name: "Turquía", code: "TUR", confederation: Confederation.UEFA, coach: "Vincenzo Montella", groupId: groups["I"] },
    { name: "Paraguay", code: "PAR", confederation: Confederation.CONMEBOL, coach: "Gustavo Alfaro", groupId: groups["I"] },
    { name: "Ghana", code: "GHA", confederation: Confederation.CAF, coach: "Otto Addo", groupId: groups["I"] },
    // Grupo J
    { name: "Escocia", code: "SCO", confederation: Confederation.UEFA, coach: "Steve Clarke", groupId: groups["J"] },
    { name: "Austria", code: "AUT", confederation: Confederation.UEFA, coach: "Ralf Rangnick", groupId: groups["J"] },
    { name: "Perú", code: "PER", confederation: Confederation.CONMEBOL, coach: "Jorge Fossati", groupId: groups["J"] },
    { name: "Camerún", code: "CMR", confederation: Confederation.CAF, coach: "Marc Brys", groupId: groups["J"] },
    // Grupo K
    { name: "Canadá", code: "CAN", confederation: Confederation.CONCACAF, coach: "Jesse Marsch", groupId: groups["K"] },
    { name: "Rumania", code: "ROU", confederation: Confederation.UEFA, coach: "Edward Iordănescu", groupId: groups["K"] },
    { name: "Bolivia", code: "BOL", confederation: Confederation.CONMEBOL, coach: "Óscar Villegas", groupId: groups["K"] },
    { name: "Indonesia", code: "IDN", confederation: Confederation.AFC, coach: "Shin Tae-yong", groupId: groups["K"] },
    // Grupo L
    { name: "República Checa", code: "CZE", confederation: Confederation.UEFA, coach: "Ivan Hašek", groupId: groups["L"] },
    { name: "Ucrania", code: "UKR", confederation: Confederation.UEFA, coach: "Serhiy Rebrov", groupId: groups["L"] },
    { name: "Honduras", code: "HON", confederation: Confederation.CONCACAF, coach: "Diego Vázquez", groupId: groups["L"] },
    { name: "Argelia", code: "ALG", confederation: Confederation.CAF, coach: "Vladimir Petkovic", groupId: groups["L"] },
  ];

  const teamMap: Record<string, string> = {};
  for (const t of teamsData) {
    const team = await prisma.team.upsert({
      where: { code: t.code },
      update: { groupId: t.groupId },
      create: t,
    });
    teamMap[t.code] = team.id;
  }
  console.log(`✅ ${teamsData.length} equipos creados`);

  // ─── Jugadores (muestra representativa) ──────────────────────────────────
  const playersData = [
    // Argentina
    { firstName: "Emiliano", lastName: "Martínez", number: 23, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1992-09-02"), nationality: "Argentina", teamCode: "ARG" },
    { firstName: "Nicolás", lastName: "Otamendi", number: 19, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1988-02-12"), nationality: "Argentina", teamCode: "ARG" },
    { firstName: "Rodrigo", lastName: "De Paul", number: 7, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1994-05-24"), nationality: "Argentina", teamCode: "ARG" },
    { firstName: "Lionel", lastName: "Messi", number: 10, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1987-06-24"), nationality: "Argentina", teamCode: "ARG" },
    { firstName: "Julián", lastName: "Álvarez", number: 9, position: PlayerPosition.FORWARD, dateOfBirth: new Date("2000-01-31"), nationality: "Argentina", teamCode: "ARG" },
    // Brasil
    { firstName: "Alisson", lastName: "Becker", number: 1, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1992-10-02"), nationality: "Brasil", teamCode: "BRA" },
    { firstName: "Marquinhos", lastName: "Aoas Corrêa", number: 4, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1994-05-14"), nationality: "Brasil", teamCode: "BRA" },
    { firstName: "Casemiro", lastName: "Nascimento", number: 5, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1992-02-23"), nationality: "Brasil", teamCode: "BRA" },
    { firstName: "Vinícius", lastName: "Júnior", number: 7, position: PlayerPosition.FORWARD, dateOfBirth: new Date("2000-07-12"), nationality: "Brasil", teamCode: "BRA" },
    { firstName: "Rodrygo", lastName: "Goes", number: 11, position: PlayerPosition.FORWARD, dateOfBirth: new Date("2001-01-09"), nationality: "Brasil", teamCode: "BRA" },
    // Francia
    { firstName: "Mike", lastName: "Maignan", number: 16, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1995-07-03"), nationality: "Francia", teamCode: "FRA" },
    { firstName: "Raphaël", lastName: "Varane", number: 4, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1993-04-25"), nationality: "Francia", teamCode: "FRA" },
    { firstName: "Aurélien", lastName: "Tchouaméni", number: 8, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2000-01-27"), nationality: "Francia", teamCode: "FRA" },
    { firstName: "Kylian", lastName: "Mbappé", number: 10, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1998-12-20"), nationality: "Francia", teamCode: "FRA" },
    { firstName: "Olivier", lastName: "Giroud", number: 9, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1986-09-30"), nationality: "Francia", teamCode: "FRA" },
    // España
    { firstName: "Unai", lastName: "Simón", number: 1, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1997-06-11"), nationality: "España", teamCode: "ESP" },
    { firstName: "Dani", lastName: "Carvajal", number: 2, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1992-01-11"), nationality: "España", teamCode: "ESP" },
    { firstName: "Pedri", lastName: "González", number: 8, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2002-11-25"), nationality: "España", teamCode: "ESP" },
    { firstName: "Lamine", lastName: "Yamal", number: 19, position: PlayerPosition.FORWARD, dateOfBirth: new Date("2007-07-13"), nationality: "España", teamCode: "ESP" },
    { firstName: "Álvaro", lastName: "Morata", number: 9, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1992-10-23"), nationality: "España", teamCode: "ESP" },
    // Alemania
    { firstName: "Manuel", lastName: "Neuer", number: 1, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1986-03-27"), nationality: "Alemania", teamCode: "GER" },
    { firstName: "Antonio", lastName: "Rüdiger", number: 2, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1993-03-03"), nationality: "Alemania", teamCode: "GER" },
    { firstName: "Joshua", lastName: "Kimmich", number: 6, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1995-02-08"), nationality: "Alemania", teamCode: "GER" },
    { firstName: "Florian", lastName: "Wirtz", number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2003-05-03"), nationality: "Alemania", teamCode: "GER" },
    { firstName: "Niclas", lastName: "Füllkrug", number: 9, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1993-02-09"), nationality: "Alemania", teamCode: "GER" },
    // Inglaterra
    { firstName: "Jordan", lastName: "Pickford", number: 1, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1994-03-07"), nationality: "Inglaterra", teamCode: "ENG" },
    { firstName: "Trent", lastName: "Alexander-Arnold", number: 2, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1998-10-07"), nationality: "Inglaterra", teamCode: "ENG" },
    { firstName: "Declan", lastName: "Rice", number: 4, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1999-01-14"), nationality: "Inglaterra", teamCode: "ENG" },
    { firstName: "Jude", lastName: "Bellingham", number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("2003-06-29"), nationality: "Inglaterra", teamCode: "ENG" },
    { firstName: "Harry", lastName: "Kane", number: 9, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1993-07-28"), nationality: "Inglaterra", teamCode: "ENG" },
    // Portugal
    { firstName: "Rui", lastName: "Patrício", number: 1, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1988-02-15"), nationality: "Portugal", teamCode: "POR" },
    { firstName: "Rúben", lastName: "Dias", number: 3, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1997-05-14"), nationality: "Portugal", teamCode: "POR" },
    { firstName: "Bruno", lastName: "Fernandes", number: 8, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1994-09-08"), nationality: "Portugal", teamCode: "POR" },
    { firstName: "Cristiano", lastName: "Ronaldo", number: 7, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1985-02-05"), nationality: "Portugal", teamCode: "POR" },
    { firstName: "Rafael", lastName: "Leão", number: 11, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1999-06-10"), nationality: "Portugal", teamCode: "POR" },
    // Colombia
    { firstName: "Camilo", lastName: "Vargas", number: 1, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1992-01-08"), nationality: "Colombia", teamCode: "COL" },
    { firstName: "Dávinson", lastName: "Sánchez", number: 6, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("1996-06-12"), nationality: "Colombia", teamCode: "COL" },
    { firstName: "Matheus", lastName: "Uribe", number: 13, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1991-03-11"), nationality: "Colombia", teamCode: "COL" },
    { firstName: "James", lastName: "Rodríguez", number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1991-07-12"), nationality: "Colombia", teamCode: "COL" },
    { firstName: "Luis", lastName: "Díaz", number: 7, position: PlayerPosition.FORWARD, dateOfBirth: new Date("1997-01-13"), nationality: "Colombia", teamCode: "COL" },
    // USA
    { firstName: "Matt", lastName: "Turner", number: 1, position: PlayerPosition.GOALKEEPER, dateOfBirth: new Date("1994-06-24"), nationality: "USA", teamCode: "USA" },
    { firstName: "Sergiño", lastName: "Dest", number: 2, position: PlayerPosition.DEFENDER, dateOfBirth: new Date("2000-11-03"), nationality: "USA", teamCode: "USA" },
    { firstName: "Tyler", lastName: "Adams", number: 4, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1999-02-14"), nationality: "USA", teamCode: "USA" },
    { firstName: "Christian", lastName: "Pulisic", number: 10, position: PlayerPosition.MIDFIELDER, dateOfBirth: new Date("1998-09-18"), nationality: "USA", teamCode: "USA" },
    { firstName: "Ricardo", lastName: "Pepi", number: 9, position: PlayerPosition.FORWARD, dateOfBirth: new Date("2003-01-09"), nationality: "USA", teamCode: "USA" },
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

  // ─── Partidos de muestra (Grupo A) ───────────────────────────────────────
  const aztecaId = stadiums["Estadio Azteca"];
  const metlifeId = stadiums["MetLife Stadium"];

  if (aztecaId && teamMap["USA"] && teamMap["MEX"]) {
    await prisma.match.upsert({
      where: { matchNumber: 1 },
      update: {},
      create: {
        matchNumber: 1,
        stage: "GROUP",
        status: "SCHEDULED",
        scheduledAt: new Date("2026-06-11T21:00:00Z"),
        homeTeamId: teamMap["MEX"],
        awayTeamId: teamMap["USA"],
        stadiumId: aztecaId,
        groupId: groups["A"],
      },
    });
  }

  if (metlifeId && teamMap["ARG"] && teamMap["FRA"]) {
    await prisma.match.upsert({
      where: { matchNumber: 2 },
      update: {},
      create: {
        matchNumber: 2,
        stage: "GROUP",
        status: "SCHEDULED",
        scheduledAt: new Date("2026-06-12T18:00:00Z"),
        homeTeamId: teamMap["ARG"],
        awayTeamId: teamMap["FRA"],
        stadiumId: metlifeId,
        groupId: groups["C"],
      },
    });
  }
  console.log("✅ Partidos de muestra creados");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email:     admin@mundial2026.com");
  console.log("🔑 Password:  admin123456");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
