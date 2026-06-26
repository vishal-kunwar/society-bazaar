try {
  const res = await fetch("http://localhost:3001/api/societies");
  console.log("Response status:", res.status);
  const data = await res.json();
  console.log("Data:", data);
} catch (e) {
  console.error("API check failed:", e.message);
}
