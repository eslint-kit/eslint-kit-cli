import inquirer from 'inquirer'

export async function askForReplacePermission(): Promise<boolean> {
  const name = 'allowed'

  return inquirer
    .prompt([
      {
        name,
        type: 'confirm',
        default: false,
        message:
          'You already have ESLint config in your project. ' +
          'Do you want to override it with eslint-kit?',
      },
    ])
    .then((answers) => answers[name])
}
