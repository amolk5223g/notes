interface LoginFormProps {
  onSwitchToRegister: () => void  // Change from onToggleMode to onSwitchToRegister
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  // Update all references inside the component:
  // Replace onToggleMode with onSwitchToRegister
}
