import React from "react";
import { Link } from "react-router-dom";

function UserHome() {
  const latestPosts = [
    { title: "Frontend Developer Intern", company: "Google", type: "Internship" },
    { title: "Java Developer", company: "TCS", type: "Full-Time" },
    { title: "Cyber Security Internship", company: "Infosys", type: "Internship" },
  ];

  const companies = ["Google", "Amazon", "TCS", "Infosys", "Microsoft"];

  return (
    <div style={styles.wrapper}>

      {/* =========== SIDEBAR ============= */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>JobPortal</h2>

        <nav style={styles.nav}>
          <Link to="/employee/home" style={styles.navItem}>🏠 Home</Link>
          <Link to="/employee/internships" style={styles.navItem}>💼 Internships</Link>
          <Link to="/employee/jobs" style={styles.navItem}>📋 Jobs</Link>
          <Link to="/employee/competitions" style={styles.navItem}>🏆 Competitions</Link>
          <Link to="/employee/resume" style={styles.navItem}>📄 Resume</Link>
          <Link to="/employee/profile" style={styles.navItem}>👤 Profile</Link>
        </nav>
      </aside>

      {/* =========== MAIN CONTENT ============= */}
      <main style={styles.main}>
        
        {/* Profile Completion Banner */}
        <div style={styles.banner}>
          <div>
    
         <p style={styles.bannerText}>
              A complete profile increases your job & internship chances.
            </p>
          </div>

          <Link to="/employee/profile">
            <button style={styles.bannerBtn}>Complete Now</button>
          </Link>
        </div>

        {/* Latest Posts */}
        <h2 style={styles.sectionTitle}>Latest Posts For You</h2>
        <div style={styles.cardGrid}>
          {latestPosts.map((post, i) => (
            <div key={i} style={styles.postCard}>
              <h3>{post.title}</h3>
              <p><strong>Company:</strong> {post.company}</p>
              <p><strong>Type:</strong> {post.type}</p>
              <button style={styles.applyBtn}>View Details</button>
            </div>
          ))}
        </div>

        {/* Top Companies */}
        <h2 style={styles.sectionTitle}>Top Companies Hiring</h2>

        <div style={styles.cardGrid}>
          {companies.map((c, i) => (
            <div key={i} style={styles.companyCard}>
              <h3>{c}</h3>
              <p>Hiring for Developer, Analyst & Intern roles...</p>
              <button style={styles.viewBtn}>View Openings</button>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

/* ================= STYLES ================== */
const styles = {
  wrapper: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f1f5f9",
  },

  /* Sidebar */
  sidebar: {
    width: "240px",
    backgroundColor: "#1e293b",
    color: "white",
    padding: "25px 20px",
    display: "flex",
    flexDirection: "column",
  },

  logo: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "30px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  navItem: {
    padding: "12px 15px",
    backgroundColor: "#334155",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    textDecoration: "none",
  },

  /* Main Content */
  main: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },

  /* Profile Banner */
  banner: {
    backgroundColor: "white",
    padding: "20px 25px",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bannerTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
  },

  bannerText: {
    margin: "6px 0",
    fontSize: "15px",
  },

  bannerBtn: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },

  sectionTitle: {
    marginTop: "30px",
    marginBottom: "15px",
  },

  /* Cards Grid */
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },

  postCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },

  companyCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },

  applyBtn: {
    marginTop: "10px",
    padding: "8px 15px",
    backgroundColor: "#059669",
    color: "white",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },

  viewBtn: {
    marginTop: "10px",
    padding: "8px 15px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default UserHome;
