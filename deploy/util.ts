require('dotenv').config();

export const assertEnvVars = (vars: string | string[]): string[] => {
    const _vars = typeof vars === 'object' ? [...vars] : [vars];
    const rv = [];
    for (let v of _vars) {
        if (!process.env[v]) {
            throw (`${v} env variable required!`);
        }

        rv.push(process.env[v]);
    }
    return rv;
}
