import { prisma } from "@/lib/prisma";
import { StadiumsClient } from "./stadiums-client";

export const dynamic = "force-dynamic";

export default async function StadiumsPage() {
  const stadiums = await prisma.stadium.findMany({
    include: { _count: { select: { matches: true } } },
    orderBy: { name: "asc" },
  });

  return <StadiumsClient stadiums={stadiums} />;
}
