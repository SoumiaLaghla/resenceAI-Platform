
import { useTranslation } from 'react-i18next';

function NotFound() {
    const { t } = useTranslation();
    return <div>
        <h1>t('404 Not Found')</h1>
        <p>t('The page you're looking for doesn't exist!')</p>
    </div>
}

export default NotFound