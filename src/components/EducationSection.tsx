function EducationSection() {
  return (
    <section
      className="content-section education-section"
      id="education"
      aria-labelledby="education-title"
    >
      <h2 id="education-title">Education</h2>

      <article className="education-entry">
        <div className="education-entry__heading">
          <div>
            <h3>Indian Institute of Technology Kanpur</h3>
            <p className="education-entry__major">
              B.Tech. in <span className="education-entry__field-name">Electrical Engineering</span> &{' '}
              <span className="education-entry__field-name">Chemical Engineering</span>
            </p>
            <p className="education-entry__minors">
              Minors in <span className="education-entry__field-name">Machine Learning</span> ·{' '}
              <span className="education-entry__field-name">Computer Systems</span> ·{' '}
              <span className="education-entry__field-name">Management Sciences</span>
            </p>
          </div>
          <div className="education-entry__meta" aria-label="Attendance details">
            <p>2022 to Expected 2027</p>
            <p className="education-entry__location">Kanpur, India</p>
          </div>
        </div>

        <dl className="education-entry__details">
          <div>
            <dt>CPI</dt>
            <dd>8.3 / 10</dd>
          </div>
          <div>
            <dt className="education-entry__subheading">Relevant Coursework</dt>
            <dd>Data Structures & Algorithms · Fundamentals of Computing · Introduction to Machine Learning · Machine Learning with Python · Introduction to Reinforcement Learning · Convex Optimization in ML · Bayesian Modelling and Data Analysis · Parallel Computing · Introduction to Computer Graphics · Computer Arithmetic on FPGA · Control System Analysis · Signals, Systems & Networks · Digital Electronics · Power Systems · Linear Algebra</dd>
          </div>
        </dl>
      </article>
    </section>
  )
}

export default EducationSection
