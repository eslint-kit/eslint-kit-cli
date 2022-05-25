export function joinArguments(args: string[]) {
  return args.filter(Boolean).join(' ')
}
