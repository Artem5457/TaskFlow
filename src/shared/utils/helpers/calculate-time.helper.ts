export const calcMillisecondsInDays = (days: number): number => {
  return days * 24 * 60 * 60 * 1000;
};

export const calcMillisecondsInHours = (hours: number): number => {
  return hours * 60 * 60 * 1000;
};

export const calcExpirationDate = (milliseconds: number): Date => {
  return new Date(Date.now() + milliseconds);
};
