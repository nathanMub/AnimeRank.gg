export const metadata = {
  title: "AnimeRank.gg",
  description: "Anime ranking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0F0F0F" }}>
        {children}
      </body>
    </html>
  );
}
