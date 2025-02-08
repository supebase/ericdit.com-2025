declare module "@/build-time.json" {
  interface BuildTime {
    buildTime: string;
  }

  const value: BuildTime;
  export default value;
}
