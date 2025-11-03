const config = {
  public: ['/login', '/signup', '/forgot_password'],
  protected: {
    Member: ['/profile/*', '/password/*', '/dashboard/*', '/logout', '/'],
    'Data Encoder': ['/tracker' ],
    'Data Manager': ['/data/*', '/exceljs', '/history/*', '/patient/*', '/user/*'],
  },
  hierarchy: ['Member', 'Data Encoder', 'Data Manager'],
};


const expandedRoles = {};
const pathToRegex = (path) => {
  if (path.endsWith('/*')) {
    const base = path.slice(0, -2);
    return new RegExp(`^${base}(/.*)?$`);
  } else {
    return new RegExp(`^${path}$`);
  }
};

config.hierarchy.forEach((role, i) => {
  const inherited = config.hierarchy.slice(0, i + 1);
  expandedRoles[role] = inherited.flatMap(r =>
    (config.protected[r] || []).map(pathToRegex)
  );
});

const allRoutes = [
  ...config.public.map(pathToRegex),
  ...Object.values(expandedRoles).flat()
];

export default { ...config, expandedRoles, allRoutes};