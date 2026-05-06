import React, { useEffect, useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Button from '@/components/elements/button/Button';
import { faTags, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ServerContext } from '@/state/server';
import http from '@/api/http';
import useFlash from '@/plugins/useFlash';
import Spinner from '@/components/elements/Spinner';

const softwareIcons: Record<string, { icon: string, description: string }> = {
    'Paper': {
        icon: 'https://avatars.githubusercontent.com/u/7605755?v=4',
        description: 'Optimized Spigot fork.',
    },
    'Spigot': {
        icon: 'https://static.spigotmc.org/img/spigot.png',
        description: 'Standard Minecraft server.',
    },
    'Purpur': {
        icon: 'https://purpurmc.org/assets/img/logo.png',
        description: 'Ultimate performance fork.',
    },
    'Bedrock': {
        icon: 'https://www.minecraft.net/etc.clientlibs/minecraft/clientlibs/main/resources/favicon-32x32.png',
        description: 'Official Bedrock server.',
    },
    'Vanilla': {
        icon: 'https://www.minecraft.net/etc.clientlibs/minecraft/clientlibs/main/resources/favicon-32x32.png',
        description: 'Official Minecraft server.',
    },
    'PocketMine': {
        icon: 'https://avatars.githubusercontent.com/u/2357771?v=4',
        description: 'High-performance Bedrock server.',
    },
};

export default () => {
    const [selectedType, setSelectedType] = useState('Paper');
    const [isInstalling, setIsInstalling] = useState(false);
    const [loading, setLoading] = useState(true);
    const [softwareData, setSoftwareData] = useState<Record<string, string[]>>({});
    
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const { addFlash, clearFlashes } = useFlash();

    useEffect(() => {
        if (!uuid) return;
        
        setLoading(true);
        http.get(`/api/client/servers/${uuid}/versions`)
            .then(({ data }) => {
                setSoftwareData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                addFlash({ type: 'error', key: 'versions', message: 'Failed to fetch versions.' });
                setLoading(false);
            });
    }, [uuid]);

    const handleInstall = (version: string) => {
        setIsInstalling(true);
        clearFlashes('versions');
        
        http.post(`/api/client/servers/${uuid}/versions/install`, {
            type: selectedType,
            version
        }).then(() => {
            addFlash({ type: 'success', key: 'versions', message: `Installing ${selectedType} ${version}... Check your console for progress.` });
            setIsInstalling(false);
        }).catch((error) => {
            console.error(error);
            addFlash({ type: 'error', key: 'versions', message: error.response?.data?.error || 'Failed to start installation.' });
            setIsInstalling(false);
        });
    };

    if (!uuid || loading) return <Spinner size={'large'} centered />;

    return (
        <PageContentBlock title={'Version Changer'} showFlashKey={'versions'}>
            <div css={tw`grid grid-cols-1 md:grid-cols-4 gap-6`}>
                <div css={tw`md:col-span-1`}>
                    <TitledGreyBox title={'Software'}>
                        {Object.keys(softwareData).map((key) => (
                            <div 
                                key={key}
                                onClick={() => setSelectedType(key)}
                                css={[
                                    tw`flex items-center p-3 mb-2 rounded cursor-pointer transition-all border border-transparent`,
                                    selectedType === key ? tw`bg-yellow-600 bg-opacity-10 border-yellow-600` : tw`hover:bg-neutral-800`
                                ]}
                            >
                                <img 
                                    src={softwareIcons[key]?.icon || 'https://static.spigotmc.org/img/spigot.png'} 
                                    alt={key} 
                                    css={tw`w-6 h-6 mr-3 object-contain`} 
                                />
                                <div css={tw`overflow-hidden`}>
                                    <div css={tw`text-sm font-bold text-white`}>{key}</div>
                                    <div css={tw`text-xs text-neutral-400 truncate`}>{softwareIcons[key]?.description || 'Minecraft Software'}</div>
                                </div>
                            </div>
                        ))}
                    </TitledGreyBox>
                </div>
                <div css={tw`md:col-span-3`}>
                    <TitledGreyBox title={`${selectedType} Versions`} icon={faTags}>
                        <div css={tw`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
                            {softwareData[selectedType]?.map((version) => (
                                <div key={version} css={tw`bg-neutral-900 bg-opacity-50 p-4 rounded border border-neutral-800 flex flex-col justify-between hover:border-yellow-600 transition-all`}>
                                    <div>
                                        <div css={tw`text-lg font-bold text-yellow-500 mb-1`}>{version}</div>
                                        <div css={tw`text-xs text-neutral-500 mb-4`}>Release Build</div>
                                    </div>
                                    <Button 
                                        isSecondary 
                                        size={'small'} 
                                        onClick={() => handleInstall(version)}
                                        disabled={isInstalling}
                                    >
                                        <div css={tw`flex items-center`}>
                                            <FontAwesomeIcon icon={faDownload} css={tw`mr-2`} /> Install
                                        </div>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TitledGreyBox>
                </div>
            </div>
        </PageContentBlock>
    );
};

