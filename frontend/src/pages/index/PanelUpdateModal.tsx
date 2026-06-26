import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Modal, Switch, Tag } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

import { HttpUtil, PromiseUtil } from '@/utils';
import { formatPanelVersion } from '@/lib/panel-version';
import './PanelUpdateModal.css';

export interface PanelUpdateInfo {
  channel?: string;
  currentVersion: string;
  latestVersion: string;
  currentCommit?: string;
  latestCommit?: string;
  updateAvailable: boolean;
}

interface BusyEvent {
  busy: boolean;
  tip?: string;
}

interface PanelUpdateModalProps {
  open: boolean;
  info: PanelUpdateInfo;
  isDevBuild?: boolean;
  devChannelEnable?: boolean;
  onChannelChange?: (dev: boolean) => void | Promise<void>;
  onClose: () => void;
  onBusy: (e: BusyEvent) => void;
}

export default function PanelUpdateModal({
  open,
  info,
  isDevBuild,
  devChannelEnable,
  onChannelChange,
  onClose,
  onBusy,
}: PanelUpdateModalProps) {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const [channelBusy, setChannelBusy] = useState(false);

  const isDev = info.channel === 'dev';
  const currentVersionLabel = isDev
    ? info.currentCommit || '?'
    : formatPanelVersion(window.X_UI_CUR_VER || info.currentVersion) || '?';
  const latestVersionLabel = isDev
    ? info.latestCommit || '-'
    : formatPanelVersion(info.latestVersion) || '-';
  const updateTargetLabel = isDev
    ? info.latestVersion || info.latestCommit || ''
    : formatPanelVersion(info.latestVersion);

  async function pollUntilBack(): Promise<boolean> {
    await PromiseUtil.sleep(5000);
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      try {
        const r = await axios.get('/panel/api/server/status', { timeout: 2000 });
        if (r?.data?.success) return true;
      } catch {
        /* still restarting */
      }
      await PromiseUtil.sleep(2000);
    }
    return false;
  }

  async function handleChannel(checked: boolean) {
    if (!onChannelChange) return;
    setChannelBusy(true);
    try {
      await onChannelChange(checked);
    } finally {
      setChannelBusy(false);
    }
  }

  function updatePanel() {
    modal.confirm({
      title: t('pages.index.panelUpdateDialog'),
      content: t('pages.index.panelUpdateDialogDesc').replace('#version#', updateTargetLabel || ''),
      okText: t('confirm'),
      cancelText: t('cancel'),
      onOk: async () => {
        const baseTip = t('pages.index.dontRefresh');
        const tip = updateTargetLabel ? `${baseTip} (${updateTargetLabel})` : baseTip;
        onClose();
        onBusy({ busy: true, tip });
        const result = await HttpUtil.post('/panel/api/server/updatePanel');
        if (!result?.success) {
          onBusy({ busy: false });
          return;
        }
        const back = await pollUntilBack();
        if (back) await PromiseUtil.sleep(800);
        window.location.reload();
      },
    });
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={t('pages.index.updatePanel')}
        footer={null}
        onCancel={onClose}
      >
        {info.updateAvailable && (
          <Alert
            type="warning"
            className="mb-12"
            title={t('pages.index.panelUpdateDesc')}
            showIcon
          />
        )}

        {isDevBuild && (
          <div className="version-list">
            <div className="version-list-item">
              <span>{t('pages.index.devChannel')}</span>
              <Switch
                checked={!!devChannelEnable}
                loading={channelBusy}
                onChange={handleChannel}
              />
            </div>
          </div>
        )}

        {devChannelEnable && (
          <Alert
            type="info"
            className="mb-12"
            title={t('pages.index.devChannelWarning')}
            showIcon
          />
        )}

        <div className="version-list">
          <div className="version-list-item">
            <span>{isDev ? t('pages.index.currentCommit') : t('pages.index.currentPanelVersion')}</span>
            <Tag color="green">{currentVersionLabel}</Tag>
          </div>
          {info.updateAvailable ? (
            <div className="version-list-item">
              <span>{isDev ? t('pages.index.latestCommit') : t('pages.index.latestPanelVersion')}</span>
              <Tag color="purple">{latestVersionLabel}</Tag>
            </div>
          ) : (
            <div className="version-list-item">
              <span>{t('pages.index.panelUpToDate')}</span>
              <Tag color="green">{t('pages.index.panelUpToDate')}</Tag>
            </div>
          )}
        </div>

        <div className="actions-row">
          <Button
            type="primary"
            disabled={!info.updateAvailable}
            onClick={updatePanel}
            icon={<CloudDownloadOutlined />}
          >
            {t('pages.index.updatePanel')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
