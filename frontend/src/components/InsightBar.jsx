import PropTypes from "prop-types";

const InsightBar = ({ insight }) => {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-[var(--app-text)]">Insight</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
        {insight}
      </p>
    </div>
  );
};

InsightBar.propTypes = {
  insight: PropTypes.string.isRequired,
};

export default InsightBar;
