import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Impede abrir o navegador padrão no Android
          event.preventDefault();

          // Abre no in-app browser (Android)
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
