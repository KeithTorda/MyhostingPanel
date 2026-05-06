import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

import { NavigationLinks, NavigationRouter } from '@blueprint/extends/routers/ServerRouter';
import BeforeSubNavigation from '@blueprint/components/Navigation/SubNavigation/BeforeSubNavigation';
import AdditionalServerItems from '@blueprint/components/Navigation/SubNavigation/AdditionalServerItems';
import AfterSubNavigation from '@blueprint/components/Navigation/SubNavigation/AfterSubNavigation';

const SidebarContainer = styled.div<{ collapsed: boolean; mobileOpen: boolean }>`
    width: ${props => props.collapsed ? '72px' : '220px'};
    min-height: calc(100vh - 64px);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: rgba(10, 10, 10, 0.95);
    border-right: 2px solid #fbbf24;
    box-shadow: 4px 0 20px rgba(251, 191, 36, 0.08);
    transition: width 0.3s ease;

    & .nav-links {
        display: flex;
        flex-direction: column;
        padding: 10px 9px 14px;
        gap: 8px;
        overflow-y: auto;
        overflow-x: hidden;

        & .nav-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 4px 0 8px;
            border-bottom: 1px solid rgba(251, 191, 36, 0.08);
        }

        & .nav-group:last-child {
            border-bottom: 0;
        }

        & .nav-category {
            padding: 4px 10px 2px;
            color: rgba(251, 191, 36, 0.62);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.4px;
            line-height: 1;
            text-transform: uppercase;
            opacity: ${props => props.collapsed ? 0 : 1};
            max-height: ${props => props.collapsed ? '0' : '20px'};
            overflow: hidden;
            transition: opacity 0.2s ease, max-height 0.25s ease;
        }

        & a {
            display: flex;
            align-items: center;
            min-height: 40px;
            padding: 7px 9px;
            border: 1px solid rgba(255, 255, 255, 0.055);
            border-left: 3px solid transparent;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.025);
            color: rgba(224, 224, 224, 0.72);
            text-decoration: none;
            transition: all 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-size: 11px;

            &:hover {
                background: rgba(251, 191, 36, 0.08);
                border-color: rgba(251, 191, 36, 0.22);
                border-left-color: rgba(251, 191, 36, 0.65);
                color: #fbbf24;
                box-shadow: 0 0 16px rgba(251, 191, 36, 0.08);
            }

            &.active {
                background: linear-gradient(90deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.04));
                border-color: rgba(251, 191, 36, 0.34);
                border-left-color: #fbbf24;
                color: #fbbf24;
                box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.08), 0 0 18px rgba(251, 191, 36, 0.12);
            }

            & .sidebar-link-content {
                display: flex;
                align-items: center;
                gap: 11px;
                width: 100%;
                min-width: 0;
            }

            & .sidebar-link-icon {
                min-width: 22px;
                width: 22px;
                height: 22px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 7px;
                background: rgba(251, 191, 36, 0.07);
                color: currentColor;
            }

            & .sidebar-link-text {
                opacity: ${props => props.collapsed ? 0 : 1};
                max-width: ${props => props.collapsed ? '0' : '170px'};
                transition: opacity 0.2s ease, max-width 0.3s ease;
                overflow: hidden;
                text-overflow: ellipsis;
                font-weight: 700;
            }
        }
    }

    @media (max-width: 768px) {
        display: ${props => props.mobileOpen ? 'flex' : 'none'};
        position: fixed;
        top: 56px;
        left: 0;
        bottom: 0;
        z-index: 60;
        width: 220px;
        min-width: 220px;
        min-height: 0;
        height: calc(100vh - 56px);
        border-right-width: 2px;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.45), 4px 0 20px rgba(251, 191, 36, 0.12);

        & .nav-links {
            padding: 10px;
            gap: 8px;

            & .nav-category {
                opacity: 1;
                max-height: 20px;
            }

            & a {
                justify-content: flex-start;
                padding: 8px 10px;
                width: 100%;
                border-left-width: 3px;

                & .sidebar-link-text {
                    display: inline-block;
                    opacity: 1;
                    max-width: 200px;
                }
            }
        }
    }
`;

const HamburgerButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(251, 191, 36, 0.15);
    color: rgba(251, 191, 36, 0.5);
    cursor: pointer;
    transition: color 0.3s ease, background 0.3s ease;
    font-size: 18px;

    &:hover {
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.05);
        box-shadow: 0 0 10px rgba(251, 191, 36, 0.1);
    }

    @media (max-width: 768px) {
        padding: 11px 0;
        font-size: 14px;
    }
`;

const ServerLayout = styled.div`
    display: flex;
    flex-direction: row;
    height: calc(100vh - 64px);
    width: 100%;
    min-width: 0;

    @media (max-width: 768px) {
        height: calc(100vh - 56px);
        overflow: hidden;
    }
`;

const ServerMain = styled.div`
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;

    @media (max-width: 768px) {
        width: 100vw;
        max-width: 100vw;
        padding: 10px 8px 16px;
    }
`;

const MobileSidebarButton = styled.button`
    display: none;

    @media (max-width: 768px) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid rgba(251, 191, 36, 0.4);
        border-radius: 8px;
        background: rgba(10, 10, 10, 0.92);
        color: #fbbf24;
        box-shadow: 0 0 14px rgba(251, 191, 36, 0.14);
        flex: 0 0 auto;
    }
`;

const MobileSidebarBackdrop = styled.button`
    display: none;

    @media (max-width: 768px) {
        position: fixed;
        inset: 56px 0 0 0;
        z-index: 50;
        display: block;
        border: 0;
        background: rgba(0, 0, 0, 0.45);
    }
`;

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    useEffect(() => () => { clearServerState(); }, []);

    useEffect(() => {
        setError('');
        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });
        return () => { clearServerState(); };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            <NavigationBar
                serverNavigationToggle={
                    uuid && id ? (
                        <MobileSidebarButton
                            type={'button'}
                            aria-label={mobileSidebarOpen ? 'Close server navigation' : 'Open server navigation'}
                            aria-expanded={mobileSidebarOpen}
                            onClick={() => setMobileSidebarOpen((open) => !open)}
                        >
                            <FontAwesomeIcon icon={faBars} />
                        </MobileSidebarButton>
                    ) : undefined
                }
            />
            {!uuid || !id ? (
                error ? <ServerError message={error} /> : <Spinner size={'large'} centered />
            ) : (
                <ServerLayout>
                    {mobileSidebarOpen && (
                        <MobileSidebarBackdrop
                            type={'button'}
                            aria-label={'Close server navigation'}
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                    )}
                    <CSSTransition timeout={150} classNames={'fade'} appear in>
                        <SidebarContainer collapsed={collapsed} mobileOpen={mobileSidebarOpen}>
                            <HamburgerButton
                                onClick={() => {
                                    if (window.matchMedia('(max-width: 768px)').matches) {
                                        setMobileSidebarOpen(false);
                                    } else {
                                        setCollapsed(!collapsed);
                                    }
                                }}
                                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <FontAwesomeIcon icon={faBars} />
                            </HamburgerButton>

                            <div
                                className={'nav-links'}
                                onClick={(event) => {
                                    if ((event.target as HTMLElement).closest('a')) {
                                        setMobileSidebarOpen(false);
                                    }
                                }}
                            >
                                <BeforeSubNavigation />
                                <NavigationLinks />
                                <AdditionalServerItems />
                                {rootAdmin && (
                                    <a href={`/admin/servers/view/${serverId}`} target={'_blank'} rel="noreferrer">
                                        <span style={{ minWidth: '18px', display: 'flex', justifyContent: 'center' }}>
                                            <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '16px' }} />
                                        </span>
                                        <span className={'sidebar-link-text'} style={{ marginLeft: '12px' }}>Admin View</span>
                                    </a>
                                )}
                                <AfterSubNavigation />
                            </div>
                        </SidebarContainer>
                    </CSSTransition>

                    <ServerMain>
                        <InstallListener />
                        <TransferListener />
                        <WebsocketHandler />
                        <NavigationRouter />
                    </ServerMain>
                </ServerLayout>
            )}
        </React.Fragment>
    );
};
