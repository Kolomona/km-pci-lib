// Shared configuration

export let config = {
  PCI_KEY: '',
  PCI_SECRET: '',
  USER_AGENT: '',
  PCI_BASEURL: ''
};

export function configurePCI(options: Partial<typeof config>) {
  config = { ...config, ...options };
}