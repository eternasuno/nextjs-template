export const formatDuration = (duration: number) => {
  if (duration < 0) {
    throw Error('duration must be greater than 0');
  }

  const hours = String(Math.trunc(duration / 3600)).padStart(2, '0');
  const minutes = String(Math.trunc(duration % 3600 / 60)).padStart(2, '0');
  const seconds = String(Math.trunc(duration % 60)).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};
