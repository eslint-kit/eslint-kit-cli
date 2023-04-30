import inquirer from 'inquirer'

export async function askForReplacePermission(): Promise<boolean> {
  const name = 'allowed'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: true,
        message:
          'You already have ESLint config in your project. ' +
          'Do you want to override it with eslint-kit?',
      },
    ])
    .then((answers) => answers[name])
}

export async function askForPrettierOverride(): Promise<boolean> {
  const name = 'allowed'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: false,
        message:
          'You already have Prettier config in your project. ' +
          'Do you want to override it with the eslint-kit recommended one?',
      },
    ])
    .then((answers) => answers[name])
}

export async function askAboutPackageJsonScripts(
  action: 'add' | 'replace'
): Promise<boolean> {
  const name = 'allowed'

  const canSafelyAdd = action === 'add'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: canSafelyAdd,
        message: `Do you want to ${action} "lint" and "lint:fix" package.json scripts?`,
      },
    ])
    .then((answers) => answers[name])
}

export async function confirmDependencies(): Promise<boolean> {
  const name = 'confirmed'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: true,
        message: 'Proceed?',
      },
    ])
    .then((answers) => answers[name])
}
