import React from "react";

function Resume() {
  return (
    <div style={styles.container}>
      <h2>Resume</h2>
      <p>User can upload and manage their resume here.</p>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
};

export default Resume;
