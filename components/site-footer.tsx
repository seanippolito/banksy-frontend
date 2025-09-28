export default function SiteFooter() {
    return (
        <footer className="px-6 py-6 text-center text-xs text-gray-500 border-t">
            © {new Date().getFullYear()} Banksy. All rights reserved.
        </footer>
    );
}