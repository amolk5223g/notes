interface RegisterFormProps {
  onSwitchToLogin: () => void  // Change from onToggleMode to onSwitchToLogin
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  // Update all references inside the component:
  // Replace onToggleMode with onSwitchToLogin
}
