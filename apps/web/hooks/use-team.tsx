import { tryCatch } from "@/lib/try-catch";
import { useQuery } from "@tanstack/react-query";
import { Team } from "@workspace/db";
import axios from "axios";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export const useTeams = () => {
  async function getTeam() {
    const { data, error } = await tryCatch(axios.get("/api/v1/team"));
    if (error || !data) {
      toast.error("Failed to fetch teams");
      return [];
    }

    const teams = data.data.teams;

    return teams;
  }

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: getTeam,
  });

  const [teamId, setTeamId] = useLocalStorage("teamId", "");

  if (!teamId && teams?.length) {
    setTeamId(teams[0]!.id);
  }

  const team = teams?.find((team) => team.id === teamId);

  return { teams, isLoading, team, setTeamId, teamId };
};
