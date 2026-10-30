export function getAccountAvatarUrl(seed: string) {
  const params = new URLSearchParams({
    seed,
    backgroundColor: "e9edff",
    textColor: "334ed8",
  });
  return `https://api.dicebear.com/9.x/initials/svg?${params.toString()}`;
}
